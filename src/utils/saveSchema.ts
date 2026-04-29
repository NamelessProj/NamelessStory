import { z } from "zod";

const VariableTypeSchema = z.object({
    value: z.string(),
    color: z.string().optional(),
    placeholder: z.string().optional(),
});

const HistoryEntrySchema = z.object({
    sceneId: z.string(),
    dialogueIndex: z.number().int().nonnegative(),
});

export const StateSchema = z.object({
    currentScene: z.string().min(1),
    currentDialogueIndex: z.number().int().nonnegative(),
    currentDialogueIndexMax: z.number().int().nonnegative(),
    textSpeed: z.number().positive(),
    waitingOnUserInput: z.boolean(),
    waitingOnOptionSelection: z.boolean(),
    currentText: z.string(),
    defaultNameColor: z.string(),
    musicVolume: z.number().min(0).max(1),
    isMusicMuted: z.boolean(),
    variables: z.record(z.string(), VariableTypeSchema),
    history: z.array(HistoryEntrySchema),
});

/**
 * Formats Zod validation errors into a readable string for save file validation.
 * @param errors {z.ZodError} The ZodError object containing validation issues. Each issue includes the path to the invalid field and the corresponding error message.
 * @return {string} A formatted string summarizing all validation errors, with each error indicating the path to the invalid field and the specific issue. This makes it easier for developers to identify and fix problems in the save file data structure.
 */
export const formatSaveErrors = (errors: z.ZodError): string => {
    return errors.issues.map(issue => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
    }).join("; ");
};
