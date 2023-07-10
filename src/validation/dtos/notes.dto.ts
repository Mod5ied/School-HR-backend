interface NoteFragment {
    data: any
    class: string
    subject: string
    teacherId: string
    dateUploaded: string
}

/** matches request payloads. */
export class CreateNotesDto {
    public noteBody: NoteFragment
    public encryptionKey: string
}

/** matches response payloads. */
export class SaveNotesDto {
    public dateUploaded: string
    public class: string
    public subject: string
    public teacherId: string
    public data: Blob
}