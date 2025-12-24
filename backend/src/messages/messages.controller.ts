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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Messages & Conversations')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Conversations
  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  createConversation(@Body() createDto: CreateConversationDto, @Request() req) {
    return this.messagesService.createConversation(createDto, req.user.userId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  findAllConversations(@Request() req) {
    return this.messagesService.findAllConversations(req.user.userId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  findConversationById(@Param('id') id: string) {
    return this.messagesService.findConversationById(id);
  }

  @Patch('conversations/:id')
  @ApiOperation({ summary: 'Update conversation' })
  updateConversation(@Param('id') id: string, @Body() updateData: any) {
    return this.messagesService.updateConversation(id, updateData);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete conversation' })
  deleteConversation(@Param('id') id: string) {
    return this.messagesService.deleteConversation(id);
  }

  @Patch('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  markConversationRead(@Param('id') id: string, @Request() req) {
    return this.messagesService.markConversationRead(id, req.user.userId);
  }

  // Messages
  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get messages by conversation' })
  getMessagesByConversation(@Param('conversationId') conversationId: string) {
    return this.messagesService.findMessagesByConversation(conversationId);
  }

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Create a new message' })
  createMessage(
    @Param('conversationId') conversationId: string,
    @Body() createDto: CreateMessageDto,
    @Request() req,
  ) {
    return this.messagesService.createMessage(conversationId, createDto, req.user.userId);
  }

  @Get('messages/:id')
  @ApiOperation({ summary: 'Get message by ID' })
  findMessageById(@Param('id') id: string) {
    return this.messagesService.findMessageById(id);
  }

  @Patch('messages/:id')
  @ApiOperation({ summary: 'Update message' })
  updateMessage(@Param('id') id: string, @Body() updateData: any) {
    return this.messagesService.updateMessage(id, updateData);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete message' })
  deleteMessage(@Param('id') id: string) {
    return this.messagesService.deleteMessage(id);
  }

  @Patch('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markMessageRead(@Param('id') id: string) {
    return this.messagesService.markMessageRead(id);
  }
}


