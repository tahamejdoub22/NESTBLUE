import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  console.log('🔧 Starting bootstrap...');
  console.log('🔧 Creating NestFactory with AppModule...');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in environment variables!');
    console.error('   Please check your .env file and ensure DATABASE_URL is configured.');
    process.exit(1);
  }
  
  try {
    // Add timeout to prevent hanging indefinitely (increased to 60 seconds for database connection)
    console.log('⏳ Attempting to create NestJS application (timeout: 60s)...');
    const createAppPromise = NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('NestFactory.create() timed out after 60 seconds. Check database connection and migrations.'));
      }, 60000); // Increased to 60 seconds
    });
    
    const app = await Promise.race([createAppPromise, timeoutPromise]) as any;
    console.log('✅ App module created successfully');
    
    const configService = app.get(ConfigService);
    console.log('✅ Config service initialized');

    // Security: Use Helmet to set various HTTP headers
    // Note: Disabling CSP for now to ensure Swagger UI compatibility
    app.use(helmet({
      contentSecurityPolicy: false,
    }));

    // Enable CORS
    // Allow requests from Next.js frontend (default port 3000) and other configured origins
    const corsOrigin = configService.get('CORS_ORIGIN') as string | undefined;
    const allowedOrigins = corsOrigin 
      ? corsOrigin.split(',') 
      : ['http://localhost:3000', 'http://localhost:4000'];
    
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    // Use Helmet for security headers
    // contentSecurityPolicy is disabled to ensure Swagger UI compatibility
    app.use(helmet({
      contentSecurityPolicy: false,
    }));

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Global response transformer
    app.useGlobalInterceptors(
      new TransformInterceptor(),
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // API prefix
    app.setGlobalPrefix('api');

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Cost Management API')
      .setDescription('Backend API for Cost Management Application')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Default to port 4000 to avoid conflict with Next.js (port 3000)
    // Ensure port is a number (env vars are strings)
    const portRaw = configService.get('PORT');
    const port = portRaw ? parseInt(String(portRaw), 10) : 4000;
    console.log(`🔧 Attempting to listen on port ${port}...`);
    console.log(`🔧 Port value: ${port} (type: ${typeof port}, raw: ${portRaw})`);
    
    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error(`Invalid port number: ${portRaw}. Must be between 1 and 65535.`);
    }
    
    try {
      // Use app.listen() with explicit host binding
      const server = await app.listen(port, '0.0.0.0');
      console.log(`✅ app.listen() completed successfully`);
      
      // Get the underlying HTTP server to verify
      const httpServer = app.getHttpServer();
      console.log(`🔍 HTTP server type: ${httpServer.constructor.name}`);
      console.log(`🔍 Server listening: ${httpServer.listening}`);
      
      // Get the actual address the server is listening on
      const address = httpServer.address();
      console.log(`🔍 Server address:`, address);
      
      // Double-check with netstat-like verification
      if (!httpServer.listening) {
        console.error('⚠️  WARNING: Server reports it is NOT listening!');
        throw new Error('Server is not listening after app.listen() call');
      }
      
      console.log(`🚀 Application is running on: http://localhost:${port}`);
      console.log(`🚀 Also accessible on: http://127.0.0.1:${port}`);
      console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
      console.log(`💚 Health check: http://localhost:${port}/api/health`);
      
      // Keep the process alive - log every 5 seconds to verify it's running
      const heartbeatInterval = setInterval(() => {
        try {
          const isListening = httpServer.listening;
          const addr = httpServer.address();
          console.log(`💓 Server heartbeat - listening: ${isListening}, address: ${JSON.stringify(addr)}, time: ${new Date().toISOString()}`);
          
          if (!isListening) {
            console.error('⚠️  Server stopped listening!');
            clearInterval(heartbeatInterval);
          }
        } catch (error) {
          console.error('❌ Error in heartbeat:', error);
        }
      }, 5000);
      
      // CRITICAL: Keep process alive by preventing exit
      // Keep stdin open to prevent automatic exit
      if (process.stdin.isTTY) {
        process.stdin.resume();
        process.stdin.setRawMode(false);
      }
      
      // Prevent the process from exiting when event loop is empty
      // This is a workaround for Node.js exiting when it thinks there's no work
      const keepAliveInterval = setInterval(() => {
        // This keeps the event loop active
      }, 1000);
      
      // Don't let this interval be garbage collected
      (global as any).__keepAliveInterval = keepAliveInterval;
      
      console.log(`✅ Server successfully started and listening on port ${port}`);
      console.log(`✅ Process will stay alive. Press Ctrl+C to stop.`);
      console.log(`✅ Heartbeat will show every 5 seconds to confirm server is running.`);
    } catch (error) {
      console.error('❌ Failed to start the application:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if ('code' in error) {
          console.error('Error code:', (error as any).code);
          if ((error as any).code === 'EADDRINUSE') {
            console.error(`⚠️  Port ${port} is already in use!`);
            console.error(`   Try: netstat -ano | findstr :${port}`);
            console.error(`   Or change PORT in .env file`);
          }
        }
      } else {
        console.error('Error details (not Error instance):', JSON.stringify(error, null, 2));
      }
      // Give time for logs to flush
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  } catch (error) {
    console.error('❌ Failed to create app:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Error details (not Error instance):', JSON.stringify(error, null, 2));
    }
    // Give time for logs to flush
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Prevent process from exiting on unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Stack:', reason instanceof Error ? reason.stack : 'No stack');
  // Don't exit - let the server continue running
});

// Prevent process from exiting on uncaught exception
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit immediately - log and try to keep running
});

// Keep process alive - prevent exit
process.on('exit', (code) => {
  console.log(`⚠️  Process exiting with code: ${code}`);
  console.log(`⚠️  Stack trace:`, new Error().stack);
});

// Override process.exit to log and prevent unexpected exits
// But allow migration scripts and other standalone scripts to exit normally
const originalExit = process.exit;
process.exit = function(code?: number) {
  // Check if we're running a migration script or other standalone script
  const scriptPath = process.argv[1] || '';
  const isMigrationScript = scriptPath.includes('run-migrations') || 
                            scriptPath.includes('revert-migration') ||
                            scriptPath.includes('migrations');
  
  // Allow migration scripts to exit normally
  if (isMigrationScript) {
    return originalExit.call(process, code);
  }
  
  console.error(`🚨 process.exit() called with code: ${code}`);
  console.error(`🚨 Stack trace:`, new Error().stack);
  
  // Only block exit with code 0 for the main server
  // Allow error exits (code !== 0) to proceed
  if (code === 0) {
    console.error(`⚠️  Blocking exit with code 0 - server should stay running!`);
    console.error(`⚠️  If you want to stop the server, press Ctrl+C`);
    return; // Don't exit
  }
  
  // Allow error exits
  originalExit.call(process, code);
} as typeof process.exit;

bootstrap().catch((error) => {
  console.error('❌ Fatal error during bootstrap:', error);
  console.error('Error type:', typeof error);
  console.error('Error constructor:', error?.constructor?.name);
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } else {
    console.error('Error details (not Error instance):', JSON.stringify(error, null, 2));
  }
  // Give time for logs to flush
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

