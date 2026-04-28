import { z } from "zod";
import {END_STORY_TOKEN} from "./constants.ts";

const NameDisplaySchema = z.enum(["short", "full"]);
const DialoguePositionSchema = z.enum(["bottom", "top", "center"]);
const DialogueTransitionSchema = z.enum(["none", "fade", "fade-to-black", "fade-to-white"]);
const SceneTransitionSchema = z.enum([
    "none", "fade", "fade-to-black", "fade-to-white",
    "slide-left", "slide-right", "slide-top", "slide-bottom",
]);

const SpritePositionSchema = z.union([
    z.enum(["right", "left", "center"]),
    z.object({
        x: z.number().optional(),
        y: z.number().optional(),
    }),
]);

const SpriteSchema = z.object({
    name: z.string().min(1),
    position: SpritePositionSchema.optional(),
    inDialogueBox: z.boolean().optional(),
    mirror: z.boolean().optional(),
});

const OptionSchema = z.object({
    text: z.string().min(1, "Option text must not be empty"),
    next: z.string().min(1, "Option next must not be empty"),
});

const VariableTypeSchema = z.object({
    value: z.string(),
    color: z.string().optional(),
});

const DialogueSchema = z.object({
    name: z.string(),
    nameDisplay: NameDisplaySchema.optional(),
    text: z.string(),
    textSpeed: z.number().positive().optional(),
    background: z.string().optional(),
    input: VariableTypeSchema.optional(),
    options: z.array(OptionSchema).optional(),
    sprite: SpriteSchema.optional(),
    next: z.string().optional(),
    dialoguePosition: DialoguePositionSchema.optional(),
    transition: DialogueTransitionSchema.optional(),
});

const SceneTypeSchema = z.object({
    background: z.string().min(1, "Scene background must not be empty"),
    bgmFile: z.string().optional(),
    bgmLoop: z.boolean().optional(),
    dialogues: z.array(DialogueSchema).min(1, "Scene must have at least one dialogue"),
    transition: SceneTransitionSchema.optional(),
});

const CharacterTypeSchema = z.object({
    name: z.string().min(0, "Character name must not be empty"),
    fullName: z.string().optional(),
    color: z.string().min(1, "Character color must not be empty"),
    sprite: z.record(z.string(), z.string()).optional(),
});

const TitleButtonsSchema = z.object({
    start: z.string().optional(),
    continue: z.string().optional(),
    load: z.string().optional(),
    credits: z.string().optional(),
    exit: z.string().optional(),
});

const TitlePageSchema = z.object({
    title: z.string().min(1, "Title must not be empty"),
    background: z.string().min(1, "Title page background must not be empty"),
    logo: z.string().optional(),
    showTitle: z.boolean().optional(),
    buttons: TitleButtonsSchema.optional(),
});

const CreditSchema = z.object({
    name: z.string().min(1, "Credit name must not be empty"),
    role: z.string().optional(),
});

const CreditGroupSchema = z.object({
    groupName: z.string().min(1, "Credit group name must not be empty"),
    credits: z.array(CreditSchema),
});

const CreditsPageSchema = z.object({
    title: z.string().min(1, "Credits page title must not be empty"),
    background: z.string().min(1, "Credits page background must not be empty"),
    scrollSpeedInPixelsPerSecond: z.number().positive().optional(),
    creditGroups: z.array(CreditGroupSchema),
});

const SettingsSchema = z.object({
    startingScene: z.string().min(1, "startingScene must not be empty"),
    textSpeed: z.number().positive().optional(),
    defaultNameColor: z.string().optional(),
    defaultNameDisplay: NameDisplaySchema.optional(),
    defaultDialoguePosition: DialoguePositionSchema.optional(),
    historyLimit: z.number().int().positive().optional(),
    defaultSceneTransition: SceneTransitionSchema.optional(),
    defaultDialogueTransition: DialogueTransitionSchema.optional(),
    transitionDuration: z.number().nonnegative().optional(),
    titlePage: TitlePageSchema,
    creditsPage: CreditsPageSchema,
});

export const VNStorySchema = z.object({
    settings: SettingsSchema,
    characters: z.record(z.string(), CharacterTypeSchema),
    story: z.record(z.string(), SceneTypeSchema),
}).superRefine((data, ctx) => {
    if (!data.story[data.settings.startingScene]) {
        ctx.addIssue({
            code: "custom",
            message: `"${data.settings.startingScene}" does not exist in story — check settings.startingScene`,
            path: ["settings", "startingScene"],
        });
    }

    for (const [sceneId, scene] of Object.entries(data.story)) {
        scene.dialogues.forEach((dialogue, i) => {
            const targets = [
                ...(dialogue.options ?? []).map(o => ({ value: o.next, path: [sceneId, "dialogues", i, "options"] })),
                ...(dialogue.next ? [{ value: dialogue.next, path: [sceneId, "dialogues", i, "next"] }] : []),
            ];

            for (const target of targets) {
                const [targetScene] = target.value.split(":");
                if (!data.story[targetScene] && targetScene !== END_STORY_TOKEN) {
                    ctx.addIssue({
                        code: "custom",
                        message: `Scene "${targetScene}" does not exist`,
                        path: ["story", ...target.path],
                    });
                }
            }
        });
    }
});

/**
 * Formats Zod validation errors into a more readable array of error messages. Each message includes the path to the invalid field and the corresponding error message, making it easier to identify and fix issues in the story script.
 * @param errors {z.ZodError} The ZodError object containing validation errors from parsing the story script. This object includes details about which fields failed validation and why.
 * @returns {string[]} An array of formatted error messages. Each message is a string that combines the path to the invalid field (if available) and the specific error message, providing clear feedback on what needs to be corrected in the story script.
 */
export const formatStoryErrors = (errors: z.ZodError): string[] => {
    return errors.issues.map(issue => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
    });
}
