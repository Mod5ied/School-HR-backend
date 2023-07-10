import { Body, Controller, Delete, Get, Param, Post, UseInterceptors } from "@nestjs/common";
import { CreateNotesDto } from "src/validation/dtos/notes.dto";
import { NotesInterceptor } from "./notes.intercept";
import { NotesServices } from "./notes.services";


@Controller('notes')
export class NotesController {
    constructor(private readonly notesServices: NotesServices) { }

    @Get('/:subject/:teacherId')
    @UseInterceptors(NotesInterceptor)
    async returnNotes(@Param() params: { subject: string, teacherId: string }) {
        const { subject, teacherId } = params;
        return await this.notesServices.fetchNotes(subject, teacherId);
    }

    @Post('/new')
    @UseInterceptors(NotesInterceptor)
    async saveNote(@Body() note: CreateNotesDto) {
        return await this.notesServices.uploadToNotes(note);
    }

    @Delete('/:subject/:teacherId')
    @UseInterceptors(NotesInterceptor)
    async deleteNotes(@Param() params: { subject: string, teacherId: string }) {
        const { subject, teacherId } = params;
        return await this.notesServices.deleteNotes(subject, teacherId);
    }
}