import VNPlayer from "./components/VNPlayer";

const App = () => {
    return (
        <div id="app" className="centered">
            <VNPlayer scriptFile="story.sample" />
        </div>
    );
};

export default App;
