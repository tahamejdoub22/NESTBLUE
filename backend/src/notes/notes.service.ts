import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note, NoteColor } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    try {
      if (!userId) {
        throw new BadRequestException('UserId is required');
      }
      const note = this.notesRepository.create({
        ...createNoteDto,
        userId,
        color: createNoteDto.color || NoteColor.YELLOW,
        rotation: createNoteDto.rotation || 0,
      });
      return await this.notesRepository.save(note);
    } catch (error) {
      console.error('Error in NotesService.create:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create note');
    }
  }

  async findAll(userId: string): Promise<Note[]> {
    try {
      if (!userId) {
        throw new BadRequestException('UserId is required');
      }
      const notes = await this.notesRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      return notes || [];
    } catch (error) {
      console.error('Error in NotesService.findAll:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch notes');
    }
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id, userId },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<Note> {
    const note = await this.findOne(id, userId);
    Object.assign(note, updateNoteDto);
    return this.notesRepository.save(note);
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.findOne(id, userId);
    await this.notesRepository.remove(note);
  }
}


