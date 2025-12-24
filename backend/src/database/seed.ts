import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getDatabaseConfig } from '../config/database.config';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Import entities
import { User, UserStatus } from '../users/entities/user.entity';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { Task, TaskStatus, TaskPriority } from '../tasks/entities/task.entity';
import { Cost, CostCategory, Currency } from '../costs/entities/cost.entity';
import { Expense, ExpenseFrequency } from '../expenses/entities/expense.entity';
import { Budget, BudgetPeriod } from '../budgets/entities/budget.entity';
import { Contract, ContractStatus, PaymentFrequency } from '../contracts/entities/contract.entity';
import { Sprint, SprintStatus } from '../sprints/entities/sprint.entity';
import { TeamSpace } from '../projects/entities/team-space.entity';
import { Conversation, ConversationType } from '../messages/entities/conversation.entity';
import { Message } from '../messages/entities/message.entity';
import { Notification, NotificationType } from '../notifications/entities/notification.entity';
import { Note, NoteColor } from '../notes/entities/note.entity';
import { ProjectMember, ProjectMemberRole } from '../projects/entities/project-member.entity';
import { Subtask } from '../tasks/entities/subtask.entity';
import { Comment } from '../tasks/entities/comment.entity';
import { Attachment } from '../tasks/entities/attachment.entity';

// Load environment variables
config();

async function generateUid(): Promise<string> {
  return `PRJ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

async function generateTaskUid(): Promise<string> {
  return uuidv4().replace(/-/g, '').substring(0, 12);
}

async function generateTaskIdentifier(projectName: string, index: number): Promise<string> {
  const prefix = projectName.substring(0, 3).toUpperCase().replace(/\s/g, '');
  return `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

function generateContractNumber(index: number): string {
  const year = new Date().getFullYear();
  return `CNT-${year}-${String(index + 1).padStart(4, '0')}`;
}

export async function seed() {
  const configService = new ConfigService();
  const dbConfig = getDatabaseConfig(configService);
  
  const dataSource = new DataSource({
    ...dbConfig,
    synchronize: false, // Disable to avoid constraint conflicts
    entities: [
      User,
      Project,
      Task,
      Cost,
      Expense,
      Budget,
      Contract,
      Sprint,
      TeamSpace,
      Conversation,
      Message,
      Notification,
      Note,
      ProjectMember,
      Subtask,
      Comment,
      Attachment,
    ],
  } as any);

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Create notes table if it doesn't exist
    console.log('🔧 Checking for notes table...');
    try {
      const notesTableExists = await dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'notes'
        );
      `);
      
      if (!notesTableExists[0].exists) {
        console.log('📝 Creating notes table...');
        // Ensure uuid extension exists
        await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await dataSource.query(`
          CREATE TABLE "notes" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "content" text NOT NULL,
            "color" varchar(20) NOT NULL DEFAULT 'yellow',
            "rotation" double precision NOT NULL DEFAULT 0,
            "userId" uuid,
            CONSTRAINT "PK_notes" PRIMARY KEY ("id"),
            CONSTRAINT "FK_notes_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
          );
        `);
        console.log('✅ Notes table created');
      } else {
        console.log('✅ Notes table already exists');
      }
    } catch (tableError: any) {
      console.log(`⚠️  Could not create notes table: ${tableError.message}`);
      // Continue anyway - table might already exist or be created differently
    }

    // Check and fix tasks table structure
    console.log('🔧 Checking tasks table structure...');
    try {
      // Check if tasks table exists
      const tasksTableExists = await dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'tasks'
        );
      `);
      
      if (tasksTableExists[0].exists) {
        // Check if sprintId column exists (case-insensitive check)
        const sprintIdExists = await dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'tasks' 
            AND LOWER(column_name) = LOWER('sprintId')
          );
        `);
        
        if (!sprintIdExists[0].exists) {
          console.log('📝 Adding sprintId column to tasks table...');
          try {
            await dataSource.query(`
              ALTER TABLE "tasks" 
              ADD COLUMN "sprintId" uuid;
            `);
            // Verify it was added
            const verifySprintId = await dataSource.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'tasks' 
                AND LOWER(column_name) = LOWER('sprintId')
              );
            `);
            if (verifySprintId[0].exists) {
              console.log('✅ sprintId column successfully added to tasks table');
            } else {
              console.error('❌ Failed to add sprintId column - verification failed');
              // List all columns for debugging
              const allColumns = await dataSource.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'tasks'
                ORDER BY column_name;
              `);
              console.log(`   Available columns: ${allColumns.map((c: any) => c.column_name).join(', ')}`);
            }
          } catch (alterError: any) {
            // Check if error is because column already exists (different case)
            if (alterError.code === '42701' || alterError.message.includes('already exists')) {
              console.log('⚠️  sprintId column might already exist with different case');
            } else {
              console.error(`❌ Error adding sprintId column: ${alterError.message}`);
              console.error(`   Error code: ${alterError.code}`);
              // List all columns for debugging
              const allColumns = await dataSource.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'tasks'
                ORDER BY column_name;
              `);
              console.log(`   Available columns: ${allColumns.map((c: any) => c.column_name).join(', ')}`);
              throw alterError;
            }
          }
        } else {
          console.log('✅ sprintId column already exists');
        }

        // Check if projectId column type is correct (should be varchar(50), not uuid)
        const projectIdInfo = await dataSource.query(`
          SELECT data_type, character_maximum_length
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'tasks' 
          AND LOWER(column_name) = LOWER('projectId');
        `);
        
        if (projectIdInfo.length > 0 && projectIdInfo[0].data_type === 'uuid') {
          console.log('📝 Converting projectId column from uuid to varchar(50)...');
          await dataSource.query(`
            ALTER TABLE "tasks" 
            ALTER COLUMN "projectId" TYPE varchar(50) USING "projectId"::text;
          `);
          console.log('✅ projectId column type updated');
        } else if (projectIdInfo.length > 0) {
          console.log('✅ projectId column type is correct');
        }
      } else {
        console.log('⚠️  Tasks table does not exist yet - will be created during seeding');
      }
    } catch (tableError: any) {
      console.error(`❌ Error checking/updating tasks table: ${tableError.message}`);
      console.error(`   Stack: ${tableError.stack}`);
      // Continue anyway - table might be created differently
    }

    // Clear existing data using CASCADE to handle foreign key constraints
    console.log('🗑️  Clearing existing data...');
    const tables = [
      'messages', 'conversations', 'notifications', 'notes', 'subtasks', 
      'comments', 'attachments', 'costs', 'expenses', 'budgets', 
      'contracts', 'sprints', 'tasks', 'project_members', 'projects', 
      'team_spaces', 'users'
    ];
    
    // Use TRUNCATE CASCADE to clear all tables at once, handling foreign keys
    for (const table of tables) {
      try {
        await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE`);
        console.log(`   ✓ Cleared ${table}`);
      } catch (error: any) {
        if (error.code === '42P01') {
          console.log(`   ⚠ ${table} table does not exist, skipping...`);
        } else {
          console.log(`   ⚠ Error clearing ${table}: ${error.message}`);
        }
      }
    }
    console.log('✅ Existing data cleared');

    // Seed Users
    console.log('👥 Seeding users...');
    const users: User[] = [];
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const userData = [
      {
        name: 'Alexandra Chen',
        email: 'alexandra.chen@techcorp.com',
        role: 'Project Manager',
        department: 'Engineering',
        position: 'Senior Project Manager',
        status: UserStatus.ONLINE,
        phone: '+1 (555) 123-4567',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandra',
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: { email: true, push: true, sms: false },
        },
        settings: {
          timezone: 'America/New_York',
          dateFormat: 'MMM dd, yyyy',
          currency: 'USD',
        },
      },
      {
        name: 'Marcus Rodriguez',
        email: 'marcus.rodriguez@techcorp.com',
        role: 'Developer',
        department: 'Engineering',
        position: 'Senior Full Stack Developer',
        status: UserStatus.ONLINE,
        phone: '+1 (555) 234-5678',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: { email: true, push: true, sms: false },
        },
        settings: {
          timezone: 'America/Los_Angeles',
          dateFormat: 'MM/dd/yyyy',
          currency: 'USD',
        },
      },
      {
        name: 'Sophie Laurent',
        email: 'sophie.laurent@techcorp.com',
        role: 'Designer',
        department: 'Design',
        position: 'UI/UX Designer',
        status: UserStatus.AWAY,
        phone: '+1 (555) 345-6789',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
        preferences: {
          theme: 'system',
          language: 'en',
          notifications: { email: true, push: false, sms: false },
        },
        settings: {
          timezone: 'Europe/Paris',
          dateFormat: 'dd/MM/yyyy',
          currency: 'EUR',
        },
      },
      {
        name: 'James Kim',
        email: 'james.kim@techcorp.com',
        role: 'QA Engineer',
        department: 'Quality Assurance',
        position: 'Senior QA Engineer',
        status: UserStatus.BUSY,
        phone: '+1 (555) 456-7890',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: { email: true, push: true, sms: true },
        },
        settings: {
          timezone: 'America/Denver',
          dateFormat: 'yyyy-MM-dd',
          currency: 'USD',
        },
      },
      {
        name: 'Emma Thompson',
        email: 'emma.thompson@techcorp.com',
        role: 'Developer',
        department: 'Engineering',
        position: 'Backend Developer',
        status: UserStatus.OFFLINE,
        phone: '+1 (555) 567-8901',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: { email: false, push: true, sms: false },
        },
        settings: {
          timezone: 'UTC',
          dateFormat: 'dd/MM/yyyy',
          currency: 'USD',
        },
      },
      {
        name: 'David Park',
        email: 'david.park@techcorp.com',
        role: 'Developer',
        department: 'Engineering',
        position: 'Frontend Developer',
        status: UserStatus.ONLINE,
        phone: '+1 (555) 678-9012',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: { email: true, push: true, sms: false },
        },
        settings: {
          timezone: 'America/Chicago',
          dateFormat: 'MM/dd/yyyy',
          currency: 'USD',
        },
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@techcorp.com',
        role: 'Business Analyst',
        department: 'Product',
        position: 'Senior Business Analyst',
        status: UserStatus.ONLINE,
        phone: '+1 (555) 789-0123',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: { email: true, push: false, sms: false },
        },
        settings: {
          timezone: 'America/New_York',
          dateFormat: 'MMM dd, yyyy',
          currency: 'USD',
        },
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@techcorp.com',
        role: 'DevOps Engineer',
        department: 'Engineering',
        position: 'Senior DevOps Engineer',
        status: UserStatus.ONLINE,
        phone: '+1 (555) 890-1234',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: { email: true, push: true, sms: false },
        },
        settings: {
          timezone: 'America/Los_Angeles',
          dateFormat: 'yyyy-MM-dd',
          currency: 'USD',
        },
      },
    ];

    for (const userInfo of userData) {
      const user = dataSource.getRepository(User).create({
        ...userInfo,
        password: hashedPassword,
        emailVerified: true,
        preferences: userInfo.preferences as any,
        settings: userInfo.settings as any,
      });
      const savedUser = await dataSource.getRepository(User).save(user);
      users.push(savedUser);
    }
    console.log(`✅ Created ${users.length} users`);

    // Seed Team Spaces
    console.log('🏢 Seeding team spaces...');
    const teamSpaces: TeamSpace[] = [];
    const spaceData = [
      {
        name: 'Engineering Team',
        description: 'Main engineering workspace for all development projects and technical initiatives',
        color: '#3B82F6',
        icon: 'Code',
        memberIds: [users[0].id, users[1].id, users[4].id, users[5].id, users[7].id],
      },
      {
        name: 'Design Team',
        description: 'Design and UX collaboration space for creative projects',
        color: '#8B5CF6',
        icon: 'Palette',
        memberIds: [users[2].id],
      },
      {
        name: 'QA Team',
        description: 'Quality assurance and testing workspace',
        color: '#10B981',
        icon: 'CheckCircle',
        memberIds: [users[3].id],
      },
      {
        name: 'Product Team',
        description: 'Product management and business analysis workspace',
        color: '#F59E0B',
        icon: 'Briefcase',
        memberIds: [users[0].id, users[6].id],
      },
    ];

    for (const spaceInfo of spaceData) {
      const space = dataSource.getRepository(TeamSpace).create({
        ...spaceInfo,
        createdById: users[0].id,
        isActive: true,
      });
      const savedSpace = await dataSource.getRepository(TeamSpace).save(space);
      teamSpaces.push(savedSpace);
    }
    console.log(`✅ Created ${teamSpaces.length} team spaces`);

    // Seed Projects
    console.log('📁 Seeding projects...');
    const projects: Project[] = [];
    const projectData = [
      {
        name: 'E-Commerce Platform',
        description: 'Build a modern, scalable e-commerce platform with React, Node.js, and PostgreSQL. Features include user authentication, product catalog, shopping cart, payment processing, and order management.',
        status: ProjectStatus.ACTIVE,
        progress: 72,
        color: '#3B82F6',
        icon: 'ShoppingCart',
        spaceId: teamSpaces[0].id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-08-30'),
      },
      {
        name: 'Mobile App Redesign',
        description: 'Complete redesign of the mobile application with modern UI/UX principles, improved performance, and enhanced user experience across iOS and Android platforms.',
        status: ProjectStatus.ACTIVE,
        progress: 45,
        color: '#8B5CF6',
        icon: 'Smartphone',
        spaceId: teamSpaces[1].id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-09-15'),
      },
      {
        name: 'API Integration Hub',
        description: 'Integrate third-party APIs for payment processing, shipping, analytics, and customer support. Implement webhook handling and API rate limiting.',
        status: ProjectStatus.ACTIVE,
        progress: 85,
        color: '#10B981',
        icon: 'Zap',
        spaceId: teamSpaces[0].id,
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-06-20'),
      },
      {
        name: 'Testing Framework',
        description: 'Implement comprehensive testing framework with unit tests, integration tests, and E2E tests. Achieve 80%+ code coverage across all modules.',
        status: ProjectStatus.ON_HOLD,
        progress: 30,
        color: '#F59E0B',
        icon: 'TestTube',
        spaceId: teamSpaces[2].id,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-10-01'),
      },
      {
        name: 'Analytics Dashboard',
        description: 'Build real-time analytics dashboard for project insights, user behavior tracking, revenue metrics, and performance monitoring with interactive charts and filters.',
        status: ProjectStatus.ACTIVE,
        progress: 92,
        color: '#EF4444',
        icon: 'BarChart',
        spaceId: teamSpaces[0].id,
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-05-30'),
      },
      {
        name: 'Customer Portal',
        description: 'Develop customer self-service portal with account management, support ticket system, billing history, and subscription management features.',
        status: ProjectStatus.ACTIVE,
        progress: 58,
        color: '#06B6D4',
        icon: 'Users',
        spaceId: teamSpaces[3].id,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-08-15'),
      },
    ];

    for (const projectInfo of projectData) {
      const uid = await generateUid();
      const project = dataSource.getRepository(Project).create({
        ...projectInfo,
        uid,
        ownerId: users[0].id,
      });
      const savedProject = await dataSource.getRepository(Project).save(project);
      projects.push(savedProject);

      // Add project members based on project type
      let memberIds: string[] = [users[0].id]; // Always include project manager
      
      if (projectInfo.spaceId === teamSpaces[0].id) {
        // Engineering projects
        memberIds.push(users[1].id, users[4].id, users[5].id);
        if (projectInfo.name === 'API Integration Hub') {
          memberIds.push(users[7].id);
        }
      } else if (projectInfo.spaceId === teamSpaces[1].id) {
        // Design projects
        memberIds.push(users[2].id);
        // users[0] already added above
      } else if (projectInfo.spaceId === teamSpaces[2].id) {
        // QA projects
        memberIds.push(users[3].id);
      } else if (projectInfo.spaceId === teamSpaces[3].id) {
        // Product projects
        memberIds.push(users[6].id, users[1].id);
      }

      // Remove duplicates
      memberIds = [...new Set(memberIds)];

      for (let i = 0; i < memberIds.length; i++) {
        const memberId = memberIds[i];
        const role = i === 0 ? ProjectMemberRole.OWNER : 
                    i === 1 ? ProjectMemberRole.ADMIN : 
                    ProjectMemberRole.MEMBER;
        
        const member = dataSource.getRepository(ProjectMember).create({
          projectUid: uid,
          userId: memberId,
          role: role,
          invitedById: users[0].id,
        });
        await dataSource.getRepository(ProjectMember).save(member);
      }
    }
    console.log(`✅ Created ${projects.length} projects`);

    // Seed Sprints (before tasks so we can assign tasks to sprints)
    console.log('🏃 Seeding sprints...');
    const sprints: Sprint[] = [];
    const sprintNames = [
      'Sprint 1: Foundation',
      'Sprint 2: Core Features',
      'Sprint 3: Integration',
      'Sprint 4: Optimization',
      'Sprint 5: Testing',
      'Sprint 6: Launch Prep',
    ];
    
    for (let i = 0; i < 8; i++) {
      const project = projects[i % projects.length];
      const sprintStatus = i < 2 ? SprintStatus.ACTIVE : 
                          i < 4 ? SprintStatus.COMPLETED : 
                          SprintStatus.PLANNED;
      
      const sprint = dataSource.getRepository(Sprint).create({
        name: sprintNames[i % sprintNames.length],
        projectId: project.uid,
        startDate: new Date(Date.now() - (i + 1) * 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - i * 14 * 24 * 60 * 60 * 1000),
        status: sprintStatus,
        goal: `Complete ${sprintNames[i % sprintNames.length].toLowerCase()} objectives`,
        taskCount: 0, // Will be updated after tasks are assigned
        completedTaskCount: 0, // Will be updated after tasks are assigned
      });
      const savedSprint = await dataSource.getRepository(Sprint).save(sprint);
      sprints.push(savedSprint);
    }
    console.log('✅ Created 8 sprints');

    // Verify sprintId column exists before seeding tasks and refresh TypeORM metadata
    console.log('🔧 Verifying tasks table structure before seeding...');
    try {
      // List all columns to see what we have
      const allColumns = await dataSource.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks'
        ORDER BY column_name;
      `);
      console.log(`📋 Current tasks table columns: ${allColumns.map((c: any) => c.column_name).join(', ')}`);
      
      const columnNames = allColumns.map((c: any) => c.column_name.toLowerCase());
      const hasSprintId = columnNames.includes('sprintid');
      
      if (!hasSprintId) {
        console.log('📝 sprintId column missing, adding it now...');
        await dataSource.query(`
          ALTER TABLE "tasks" 
          ADD COLUMN "sprintId" uuid;
        `);
        console.log('✅ sprintId column added');
        
        // Verify it was added
        const verify = await dataSource.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'tasks'
          AND LOWER(column_name) = 'sprintid';
        `);
        if (verify.length === 0) {
          throw new Error('Failed to verify sprintId column was added');
        }
        console.log(`✅ Verified sprintId column exists as: ${verify[0].column_name}`);
      } else {
        console.log('✅ sprintId column already exists');
      }
      
      // Note: TypeORM metadata should automatically pick up the column
      // If issues persist, the column might need to be added via migration instead
    } catch (verifyError: any) {
      console.error(`❌ Error verifying sprintId column: ${verifyError.message}`);
      throw verifyError;
    }

    // Seed Tasks
    console.log('✅ Seeding tasks...');
    const tasks: Task[] = [];
    const taskData = [
      // E-Commerce Platform tasks
      [
        { title: 'Setup project structure and architecture', description: 'Initialize monorepo, configure build tools, set up CI/CD pipeline', status: TaskStatus.COMPLETE, priority: TaskPriority.HIGH },
        { title: 'Implement user authentication system', description: 'JWT-based auth with refresh tokens, password reset, email verification', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT },
        { title: 'Design and implement database schema', description: 'Create PostgreSQL schema with proper relationships and indexes', status: TaskStatus.COMPLETE, priority: TaskPriority.HIGH },
        { title: 'Build product catalog API', description: 'RESTful API for products with filtering, sorting, and pagination', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH },
        { title: 'Implement shopping cart functionality', description: 'Add to cart, update quantities, remove items, persist cart state', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
        { title: 'Integrate payment gateway', description: 'Stripe integration for secure payment processing', status: TaskStatus.TODO, priority: TaskPriority.URGENT },
      ],
      // Mobile App Redesign tasks
      [
        { title: 'Create wireframes and user flows', description: 'Design user journey maps and low-fidelity wireframes', status: TaskStatus.COMPLETE, priority: TaskPriority.MEDIUM },
        { title: 'Design color palette and typography', description: 'Establish design system with consistent colors and fonts', status: TaskStatus.COMPLETE, priority: TaskPriority.MEDIUM },
        { title: 'Build component library', description: 'Create reusable UI components following design system', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH },
        { title: 'Implement responsive layouts', description: 'Ensure layouts work across all device sizes', status: TaskStatus.TODO, priority: TaskPriority.HIGH },
        { title: 'Conduct user testing sessions', description: 'Gather feedback from beta users and iterate', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
      ],
      // API Integration Hub tasks
      [
        { title: 'Setup payment gateway integration', description: 'Configure Stripe API keys and webhook endpoints', status: TaskStatus.COMPLETE, priority: TaskPriority.URGENT },
        { title: 'Integrate shipping API', description: 'Connect with FedEx and UPS APIs for shipping calculations', status: TaskStatus.COMPLETE, priority: TaskPriority.HIGH },
        { title: 'Implement webhook handler', description: 'Create secure webhook endpoint with signature verification', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH },
        { title: 'Add API rate limiting', description: 'Implement rate limiting middleware to prevent abuse', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
        { title: 'Setup monitoring and logging', description: 'Configure error tracking and API usage analytics', status: TaskStatus.TODO, priority: TaskPriority.LOW },
      ],
      // Testing Framework tasks
      [
        { title: 'Write unit tests for core modules', description: 'Achieve 80% coverage for business logic', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH },
        { title: 'Setup E2E testing infrastructure', description: 'Configure Playwright/Cypress for end-to-end tests', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
        { title: 'Configure test coverage reporting', description: 'Set up coverage reports and CI integration', status: TaskStatus.TODO, priority: TaskPriority.LOW },
        { title: 'Write integration tests', description: 'Test API endpoints and database interactions', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
      ],
      // Analytics Dashboard tasks
      [
        { title: 'Create dashboard layout and navigation', description: 'Design main dashboard structure with sidebar navigation', status: TaskStatus.COMPLETE, priority: TaskPriority.HIGH },
        { title: 'Implement real-time charts', description: 'Build interactive charts using Chart.js/Recharts', status: TaskStatus.COMPLETE, priority: TaskPriority.HIGH },
        { title: 'Add filters and date range picker', description: 'Implement filtering by date, project, category', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM },
        { title: 'Optimize dashboard performance', description: 'Implement lazy loading and data caching', status: TaskStatus.TODO, priority: TaskPriority.LOW },
      ],
      // Customer Portal tasks
      [
        { title: 'Design portal user interface', description: 'Create mockups for customer-facing portal', status: TaskStatus.COMPLETE, priority: TaskPriority.HIGH },
        { title: 'Build account management module', description: 'Profile editing, password change, preferences', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH },
        { title: 'Implement support ticket system', description: 'Create, view, and manage support tickets', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
        { title: 'Add billing history page', description: 'Display invoices and payment history', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
      ],
    ];

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const projectTasks = taskData[i] || [];
      // Get sprints for this project
      const projectSprints = sprints.filter(s => s.projectId === project.uid);

      for (let j = 0; j < projectTasks.length; j++) {
        const taskInfo = projectTasks[j];
        const identifier = await generateTaskIdentifier(project.name, j);
        
        const assigneeIndex = j % 3;
        const assignees = [
          [users[1].id],
          [users[1].id, users[4].id],
          [users[4].id, users[5].id],
        ][assigneeIndex] || [users[1].id];
        
        // Assign task to a sprint (distribute tasks across sprints)
        const sprintIndex = projectSprints.length > 0 ? j % projectSprints.length : null;
        const sprintId = sprintIndex !== null ? projectSprints[sprintIndex].id : null;
        
        const taskUid = await generateTaskUid();
        const task = dataSource.getRepository(Task).create({
          uid: taskUid,
          identifier,
          title: taskInfo.title,
          description: taskInfo.description,
          status: taskInfo.status,
          priority: taskInfo.priority,
          projectId: project.uid, // varchar(50) - matches Project.uid type
          sprintId: sprintId, // uuid - matches Sprint.id type
          createdById: users[0].id,
          dueDate: new Date(Date.now() + (j + 1) * 7 * 24 * 60 * 60 * 1000),
          startDate: new Date(Date.now() - j * 2 * 24 * 60 * 60 * 1000),
          assigneeIds: assignees,
          estimatedCost: {
            amount: (j + 1) * 1500 + Math.random() * 500,
            currency: 'USD',
          },
        });
        const savedTask = await dataSource.getRepository(Task).save(task);
        tasks.push(savedTask);

        // Seed Subtasks for this task
        const subtaskCount = 2 + Math.floor(Math.random() * 3);
        for (let k = 0; k < subtaskCount; k++) {
          const subtask = dataSource.getRepository(Subtask).create({
            title: `Subtask ${k + 1} for ${task.title}`,
            completed: Math.random() > 0.5,
            taskUid: savedTask.uid,
          });
          await dataSource.getRepository(Subtask).save(subtask);
        }

        // Seed Comments for this task
        const commentCount = 1 + Math.floor(Math.random() * 3);
        for (let k = 0; k < commentCount; k++) {
          const author = users[k % users.length];
          const comment = dataSource.getRepository(Comment).create({
            text: `This is a comment about "${task.title}" by ${author.name}`,
            taskUid: savedTask.uid,
            authorId: author.id,
          });
          await dataSource.getRepository(Comment).save(comment);
        }

        // Seed Attachments for some tasks
        if (Math.random() > 0.7) {
          const attachment = dataSource.getRepository(Attachment).create({
            name: `Document_${j + 1}.pdf`,
            url: 'https://example.com/sample.pdf',
            size: 1024 * 1024,
            type: 'application/pdf',
            taskUid: savedTask.uid,
          });
          await dataSource.getRepository(Attachment).save(attachment);
        }
      }
    }
    console.log(`✅ Created ${tasks.length} tasks`);

    // Update sprint task counts based on assigned tasks
    console.log('📊 Updating sprint task counts...');
    for (const sprint of sprints) {
      const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
      const completedTasks = sprintTasks.filter(t => t.status === TaskStatus.COMPLETE);
      
      await dataSource.getRepository(Sprint).update(sprint.id, {
        taskCount: sprintTasks.length,
        completedTaskCount: completedTasks.length,
      });
    }
    console.log('✅ Updated sprint task counts');

    // Seed Costs
    console.log('💰 Seeding costs...');
    const costNames = [
      'Server Infrastructure',
      'Cloud Storage',
      'Third-party API Subscriptions',
      'Development Tools License',
      'Database Hosting',
      'CDN Services',
      'SSL Certificates',
      'Monitoring Services',
      'Backup Solutions',
      'Email Service Provider',
      'Domain Registration',
      'Security Audit',
      'Performance Testing Tools',
      'Code Repository Hosting',
      'Project Management Tools',
      'Design Software License',
      'Video Conferencing',
      'Team Collaboration Tools',
      'Documentation Platform',
      'Analytics Services',
    ];
    
    const costCategories = Object.values(CostCategory);
    for (let i = 0; i < 25; i++) {
      const project = projects[i % projects.length];
      const task = tasks[i % tasks.length];
      const category = costCategories[i % costCategories.length];
      
      const cost = dataSource.getRepository(Cost).create({
        name: costNames[i % costNames.length],
        amount: Math.floor(Math.random() * 5000 + 100),
        currency: Currency.USD,
        category: category,
        description: `Monthly subscription for ${costNames[i % costNames.length].toLowerCase()}`,
        date: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
        projectId: project.uid,
        taskId: i % 3 === 0 ? task.uid : null,
        tags: ['subscription', 'monthly'].slice(0, i % 2 + 1),
      });
      await dataSource.getRepository(Cost).save(cost);
    }
    console.log('✅ Created 25 costs');

    // Seed Expenses
    console.log('💸 Seeding expenses...');
    const expenseNames = [
      'Office Rent',
      'Internet & Utilities',
      'Team Lunch',
      'Conference Tickets',
      'Training Courses',
      'Software Licenses',
      'Hardware Equipment',
      'Marketing Campaign',
      'Travel Expenses',
      'Client Entertainment',
      'Legal Services',
      'Accounting Services',
      'Insurance Premium',
      'Equipment Maintenance',
      'Office Supplies',
    ];
    
    const frequencies = Object.values(ExpenseFrequency);
    for (let i = 0; i < 20; i++) {
      const project = projects[i % projects.length];
      const expense = dataSource.getRepository(Expense).create({
        name: expenseNames[i % expenseNames.length],
        amount: Math.floor(Math.random() * 3000 + 50),
        currency: Currency.USD,
        category: costCategories[i % costCategories.length],
        description: `Expense for ${expenseNames[i % expenseNames.length].toLowerCase()}`,
        frequency: frequencies[i % frequencies.length],
        startDate: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000),
        endDate: frequencies[i % frequencies.length] === ExpenseFrequency.ONE_TIME ? 
                 new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000) : 
                 new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000),
        isActive: i % 4 !== 0,
        projectId: project.uid,
        tags: ['business', 'operational'].slice(0, i % 2 + 1),
      });
      await dataSource.getRepository(Expense).save(expense);
    }
    console.log('✅ Created 20 expenses');

    // Seed Budgets
    console.log('📊 Seeding budgets...');
    const periods = Object.values(BudgetPeriod);
    const budgetNames = [
      'Q1 Development Budget',
      'Infrastructure Budget',
      'Marketing Budget',
      'Operations Budget',
      'Training & Development',
      'Equipment Budget',
      'Software Licenses Budget',
      'Travel & Events Budget',
    ];
    
    for (let i = 0; i < 12; i++) {
      const project = projects[i % projects.length];
      const budget = dataSource.getRepository(Budget).create({
        name: budgetNames[i % budgetNames.length],
        amount: (i + 1) * 15000,
        currency: Currency.USD,
        category: costCategories[i % costCategories.length],
        period: periods[i % periods.length],
        startDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + (i + 1) * 90 * 24 * 60 * 60 * 1000),
        projectId: project.uid,
      });
      await dataSource.getRepository(Budget).save(budget);
    }
    console.log('✅ Created 12 budgets');

    // Seed Contracts
    console.log('📄 Seeding contracts...');
    const vendorNames = [
      'CloudHost Solutions',
      'TechSoft Inc.',
      'DataSecure Systems',
      'WebServices Pro',
      'DevTools Enterprise',
      'Analytics Plus',
      'SecurityFirst Corp',
      'Infrastructure Global',
    ];
    
    const contractStatuses = Object.values(ContractStatus);
    const paymentFrequencies = Object.values(PaymentFrequency);
    
    for (let i = 0; i < 10; i++) {
      const project = projects[i % projects.length];
      const contract = dataSource.getRepository(Contract).create({
        name: `Service Agreement ${i + 1}`,
        contractNumber: generateContractNumber(i),
        vendor: vendorNames[i % vendorNames.length],
        vendorEmail: `contact@${vendorNames[i % vendorNames.length].toLowerCase().replace(/\s/g, '')}.com`,
        vendorPhone: `+1 (555) ${100 + i}-${1000 + i}`,
        amount: (i + 1) * 8000,
        currency: Currency.USD,
        category: costCategories[i % costCategories.length],
        description: `Annual service agreement with ${vendorNames[i % vendorNames.length]}`,
        startDate: new Date(Date.now() - i * 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + (i + 1) * 120 * 24 * 60 * 60 * 1000),
        renewalDate: new Date(Date.now() + (i + 1) * 120 * 24 * 60 * 60 * 1000),
        status: contractStatuses[i % contractStatuses.length],
        paymentFrequency: paymentFrequencies[i % paymentFrequencies.length],
        autoRenew: i % 2 === 0,
        projectId: project.uid,
        tags: ['contract', 'vendor'].slice(0, i % 2 + 1),
        attachments: [],
        notes: `Contract notes for ${vendorNames[i % vendorNames.length]}`,
      });
      await dataSource.getRepository(Contract).save(contract);
    }
    console.log('✅ Created 10 contracts');

    // Seed Conversations
    console.log('💬 Seeding conversations...');
    const conversations: Conversation[] = [];
    const conversationNames = [
      'Project Discussion',
      'Team Standup',
      'Design Review',
      'Technical Discussion',
      'Client Meeting Notes',
    ];
    
    for (let i = 0; i < 6; i++) {
      const participantIds = i < 3 ? 
        [users[0].id, users[i + 1].id] : 
        [users[0].id, users[1].id, users[2].id, users[3].id];
      
      const conversation = dataSource.getRepository(Conversation).create({
        name: conversationNames[i % conversationNames.length],
        type: participantIds.length > 2 ? ConversationType.GROUP : ConversationType.DIRECT,
        participantIds,
        unreadCount: i % 2 === 0 ? Math.floor(Math.random() * 5) : 0,
        isPinned: i % 3 === 0,
        isArchived: false,
        projectUid: i < projects.length ? projects[i].uid : null,
        spaceId: i < teamSpaces.length ? teamSpaces[i % teamSpaces.length].id : null,
      });
      const savedConv = await dataSource.getRepository(Conversation).save(conversation);
      conversations.push(savedConv);

      // Seed Messages
      const messageCount = 3 + Math.floor(Math.random() * 5);
      for (let j = 0; j < messageCount; j++) {
        const senderId = participantIds[j % participantIds.length];
        const sender = users.find(u => u.id === senderId) || users[0];
        const message = dataSource.getRepository(Message).create({
          content: j === 0 ? 
            `Hello team! Let's discuss ${conversationNames[i % conversationNames.length].toLowerCase()}.` :
            `This is message ${j + 1} in our conversation about the project.`,
          conversationId: savedConv.id,
          senderId: sender.id,
          senderName: sender.name,
          senderAvatar: sender.avatar,
          read: j < messageCount - 1,
          attachments: [],
        });
        await dataSource.getRepository(Message).save(message);
      }
    }
    console.log('✅ Created 6 conversations with messages');

    // Seed Notifications
    console.log('🔔 Seeding notifications...');
    const notificationTemplates = [
      { type: NotificationType.INFO, title: 'New task assigned', message: 'You have been assigned to a new task' },
      { type: NotificationType.SUCCESS, title: 'Project updated', message: 'Project status has been updated' },
      { type: NotificationType.WARNING, title: 'Deadline approaching', message: 'Task deadline is approaching soon' },
      { type: NotificationType.INFO, title: 'New comment', message: 'Someone commented on your task' },
      { type: NotificationType.SUCCESS, title: 'Task completed', message: 'A task has been marked as complete' },
    ];
    
    for (let i = 0; i < 20; i++) {
      const user = users[i % users.length];
      const project = projects[i % projects.length];
      const task = tasks[i % tasks.length];
      const template = notificationTemplates[i % notificationTemplates.length];
      
      const notification = dataSource.getRepository(Notification).create({
        title: template.title,
        message: `${template.message}: ${task.title}`,
        type: template.type,
        userId: user.id,
        read: i % 3 === 0,
        actionUrl: `/projects/${project.uid}/tasks/${task.uid}`,
        actionLabel: 'View Task',
        icon: 'Bell',
        projectId: project.uid,
        taskId: task.uid,
      });
      await dataSource.getRepository(Notification).save(notification);
    }
    console.log('✅ Created 20 notifications');

    // Seed Notes
    console.log('📝 Seeding notes...');
    const noteContents = [
      'Remember to review the API documentation before implementation',
      'Client requested additional features for the dashboard',
      'Need to schedule team meeting for sprint planning',
      'Important: Update security policies before next deployment',
      'Follow up with vendor about contract renewal',
      'User feedback suggests improving mobile responsiveness',
      'Consider adding dark mode support in next iteration',
      'Budget review meeting scheduled for next week',
      'Technical debt items to address in upcoming sprint',
      'Documentation needs to be updated for new features',
      'Performance optimization opportunities identified',
      'Security audit scheduled for next month',
    ];
    
    const noteColors = Object.values(NoteColor);
    for (let i = 0; i < 15; i++) {
      const user = users[i % users.length];
      const note = dataSource.getRepository(Note).create({
        content: noteContents[i % noteContents.length],
        color: noteColors[i % noteColors.length],
        rotation: (i % 3 - 1) * 5, // -5, 0, or 5 degrees
        userId: user.id,
      });
      await dataSource.getRepository(Note).save(note);
    }
    console.log('✅ Created 15 notes');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Team Spaces: ${teamSpaces.length}`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Tasks: ${tasks.length}`);
    console.log(`   - Costs: 25`);
    console.log(`   - Expenses: 20`);
    console.log(`   - Budgets: 12`);
    console.log(`   - Contracts: 10`);
    console.log(`   - Sprints: 8`);
    console.log(`   - Conversations: ${conversations.length}`);
    console.log(`   - Notifications: 20`);
    console.log(`   - Notes: 15`);
    console.log('\n🔑 Default login credentials:');
    console.log('   Email: alexandra.chen@techcorp.com');
    console.log('   Password: Password123!');
    console.log('\n   (All users use the same password)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}
