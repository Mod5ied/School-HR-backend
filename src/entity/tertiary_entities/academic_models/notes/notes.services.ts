import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { SaveNotesSchema } from "src/validation/schemas/notes.schema";
import { CacheService } from "src/services/cache/cache.service";
import { CreateNotesDto } from "src/validation/dtos/notes.dto";
import mongoose, { Model, LeanDocument } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Notes } from "./notes.model";

@Injectable()
export class NotesServices {
    constructor(
        private readonly cacheService: CacheService,
        @InjectModel(Notes.name) private readonly notesModel: Model<Notes>,
    ) { }

    /** accepts subject related to note as argument, e.g: fn('english') */
    public async fetchNotes(subject: string, teacherId: string) {
        let notes: LeanDocument<Notes & { _id: mongoose.Types.ObjectId }>
            | LeanDocument<Notes & { _id: mongoose.Types.ObjectId }>[];

        if (typeof subject === 'string') {
            notes = await this.notesModel.findOne({ $and: [{ subject }, { teacherId }] }).lean().exec();
            if (!notes) throw new NotFoundException(`Notes fetch error: ${notes}`);
        }
        else {
            notes = await this.notesModel.find({ $and: [{ subject }, { teacherId }] }).lean().exec();
            if (!notes) throw new NotFoundException(`Notes fetch error: ${notes}`);
        }
        try {
            await this.cacheService.setCache(`${subject}-note`, notes, 3600)
        } catch (error) {
            console.log('notes-error', error);
            await this.cacheService.setCache(`all-note`, notes, 3600)
        }
    }

    /* creates a new note document. */
    //todo: create every new note and save it to the teacher entity so that when teacher fetches they can populate it.
    public async uploadToNotes(notes: CreateNotesDto) {
        const { noteBody } = notes
        const note = new this.notesModel({ ...noteBody });
        const verified = SaveNotesSchema.validate(note, { abortEarly: false });
        if (verified.error) throw new BadRequestException(verified.error.message)

        const uploaded = await note.save().catch(err => { throw new BadRequestException(`Error uploading notes!: ${err}`) })
        return { data: uploaded };
    }

    public async deleteNotes(subject: string, teacherId: string) {
        const [_, noteStatus] = await Promise.all([
            this.cacheService.delCached(`${subject}-note`),
            this.notesModel.deleteOne({ $and: [{ subject }, { teacherId }] })
        ]).catch(err => { throw new BadRequestException(`Note delete operation failed: ${err}`) })
        if (noteStatus.deletedCount >= 1) return { deleted: true };
        /* confirm that this recursive expression is valid. */
        /* log the error in details. */
        else this.deleteNotes(subject, teacherId);
    }
}