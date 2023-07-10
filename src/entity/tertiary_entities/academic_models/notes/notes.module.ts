import { CacheModule, Module } from "@nestjs/common";
import { NotesController } from "./notes.controller";
import { Notes, NotesSchema } from "./notes.model";
import { MongooseModule } from "@nestjs/mongoose";
import { NotesServices } from "./notes.services";

@Module({
    imports: [
        CacheModule,
        MongooseModule.forFeature([{ name: Notes.name, schema: NotesSchema }])
    ],
    controllers: [NotesController],
    providers: [NotesServices],
    exports: [NotesServices]
})

export class NotesModule { }