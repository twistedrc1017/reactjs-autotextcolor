import React, { Component } from "react";
import "./App.less";
import { SketchPicker } from "react-color";
import brain from "brain.js";

class App extends Component {
    constructor() {
        super();
        this.state = {
            bgVAL: {
                b: 0,
                g: 0,
                r: 0
            },
            MLRGB: {
                b: 0,
                g: 0,
                r: 0
            },
            color: "white"
        };
    }
    rgbToHex = (r, g, b) => {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    };
    getRgb = hex => {
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        let newHex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });

        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(newHex);
        return result
            ? {
                  r: Math.round(parseInt(result[1], 16) / 2.55) / 100,
                  g: Math.round(parseInt(result[2], 16) / 2.55) / 100,
                  b: Math.round(parseInt(result[3], 16) / 2.55) / 100
              }
            : null;
    };
    hexToRgb = hex => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : null;
    };
    componentToHex = c => {
        let hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    componentDidMount = () => {
        // here we define the neural network
        const newBrain = new brain.NeuralNetwork();
        // it is a bad idea to run train everytime
        // ideally it should be run once and the
        // network referenced
        newBrain.train([
            { input: { r: 0, g: 0, b: 0 }, output: { white: 1 } },
            { input: { r: 1, g: 1, b: 1 }, output: { black: 1 } }
            // { input: { r: 1, g: 0, b: 0.68 }, output: { white: 1 } },
            // { input: { r: 0.67, g: 0.5, b: 0.5 }, output: { white: 1 } },
            // { input: { r: 0.58, g: 0.43, b: 0.43 }, output: { black: 1 } }
        ]);
        // save the brain dude
        this.setState({
            trainedBrain: newBrain
        });
    };
    think = (hex, trainedBrain) => {
        // convert to float cuz puter science bruh
        const rgb = this.getRgb(hex);
        console.log(rgb);

        // this will let you see the likelihood of 0 or 1
        const test = trainedBrain.run(rgb);
        // console.log("test:", test);

        // this is the result the network returns
        // you feed it the value (in this case rgb) and
        // which network to use when making it's
        // decision (network)

        const decision = brain.likely(rgb, trainedBrain);
        // console.log("result:", result);

        return decision;
    };
    handleChangeComplete = color => {
        const { hex } = color;
        const { trainedBrain } = this.state;
        let decision = this.think(hex, trainedBrain);
        console.log(decision);
        this.setState({
            bgVAL: this.hexToRgb(color.hex),
            MLRGB: this.getRgb(color.hex),
            color: decision
        });
    };
    render() {
        const { bgVAL, color, MLRGB } = this.state;
        return (
            <div
                style={{ backgroundColor: `rgb(${bgVAL.r},${bgVAL.g},${bgVAL.b})` }}
                className="background">
                <h1 style={{ color: color }} className="text">
                    {`{ input: { r: ${MLRGB.r}, g: ${MLRGB.g}, b: ${
                        MLRGB.b
                    } }, output: { ${color}: 1 } };`}
                </h1>
                <h1 style={{ color: color }} className="text">
                    {`<h1 style={{ color: ${color} }} className="text" />`}
                </h1>
                <SketchPicker color={this.state.bgVAL} onChange={this.handleChangeComplete} />
            </div>
        );
    }
}

export default App;
