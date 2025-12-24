import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notes')
@Controller('notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  async create(@Body() createNoteDto: CreateNoteDto, @Request() req) {
    try {
      if (!req.user || !req.user.userId) {
        throw new BadRequestException('User not authenticated or userId missing');
      }
      const note = await this.notesService.create(createNoteDto, req.user.userId);
      return this.transformNote(note);
    } catch (error) {
      console.error('Error in notes.create:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create note');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes for the current user' })
  async findAll(@Request() req) {
    try {
      // Ensure user is authenticated and has userId
      if (!req.user || !req.user.userId) {
        throw new BadRequestException('User not authenticated or userId missing');
      }
      const notes = await this.notesService.findAll(req.user.userId);
      return notes.map((note) => this.transformNote(note));
    } catch (error) {
      console.error('Error in notes.findAll:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch notes');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    const note = await this.notesService.findOne(id, req.user.userId);
    return this.transformNote(note);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update note' })
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Request() req,
  ) {
    const note = await this.notesService.update(id, updateNoteDto, req.user.userId);
    return this.transformNote(note);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete note' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.notesService.remove(id, req.user.userId);
    return { success: true, message: 'Note deleted successfully' };
  }

  private transformNote(note: any) {
    return {
      id: note.id,
      content: note.content,
      color: note.color,
      rotation: note.rotation,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
}


