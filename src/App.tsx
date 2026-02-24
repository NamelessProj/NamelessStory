import type {VNStory} from "./interfaces/interfaces.ts";
import VNPlayer from "./components/VNPlayer";

const App = () => {
    const story: VNStory = {
        settings: {
            startingScene: "start",
            textSpeed: 50,
            titlePage: {
                title: "My Visual Novel",
                background: "title_bg.png"
            },
            creditsPage: {
                title: "Credits",
                background: "credits_bg.png",
                creditGroups: [
                    {
                        groupName: "Development Team",
                        credits: [
                            { name: "Alice", role: "Lead Developer" },
                            { name: "Bob", role: "Artist" }
                        ]
                    },
                    {
                        groupName: "Special Thanks",
                        credits: [
                            { name: "Charlie", role: "Tester" }
                        ]
                    }
                ]
            }
        },
        characters: {
            "Alice": {
                color: "red",
                sprite: {
                    "wave": "alice_right.png",
                    "idle": "alice_left.png"
                }
            },
            "Bob": {
                color: "blue",
                sprite: {
                    "wave": "bob_right.png",
                    "idle": "bob_left.png"
                }
            }
        },
        story: {
            "start": {
                background: "bg_start.png",
                bgmFile: "bgm_start.mp3",
                dialogues: [
                    {
                        name: "",
                        text: "Welcome to our visual novel!"
                    }
                ]
            },
            "scene01": {
                background: "bg_scene01.png",
                bgmFile: "bgm_scene01.mp3",
                dialogues: [
                    {
                        name: "Alice",
                        text: "Hi there! I'm Alice.",
                        sprite: {
                            name: "idle"
                        }
                    }
                ]
            }
        }
    };

    return (
        <div id="app">
            <VNPlayer scriptFile="story.sample" />
        </div>
    );
};

export default App;