# NamelessStory

Wanna make a visual novel but don't know how to code? NamelessStory is a visual novel engine that allows you to create your own visual novel without any coding knowledge. It's text-based, so you can focus on writing your story and creating your characters. It's also open source, so you can contribute to the project and make it better.

![React.js version](https://img.shields.io/badge/React.js-^19.2.0-61DAFB?style=for-the-badge)
![License](https://img.shields.io/github/license/NamelessProj/NamelessStory?style=for-the-badge)
![Repo size](https://img.shields.io/github/repo-size/NamelessProj/NamelessStory?style=for-the-badge)

## Introduction

NamelessStory is a visual novel engine that allows you to create your own visual novel without any coding knowledge. It's text-based, so you can focus on writing your story and creating your characters. It's also open source, so you can contribute to the project and make it better.

## Goals / Philosophy

**Accessibility**: We want to make it easy for anyone to create their own visual novel, regardless of their technical skills.

**Easy to use**: We want to make it easy for users to create their own visual novel without having to learn a new programming language.

**Open source**: We want to make it open source so that anyone can contribute to the project and make it better.

## Demo / Example

[Here will be a demo of the engine.]

## Installation

To install NamelessStory, you can clone the repository and run the following command in the terminal:

To clone the repository, run:
```bash
git clone https://github.com/NamelessProj/NamelessStory.git
```
Then, navigate to the project directory and install the dependencies: (make sure you have Node.js and npm installed on your machine)
```bash
cd NamelessStory
npm install
```

### Node.js and npm
If you don't have Node.js and npm installed, you can download them from the official website: [https://nodejs.org/](https://nodejs.org/). After installing Node.js, npm will be installed automatically.

## Usage
To start the development server, run the following command in the terminal:
```bash
npm run dev
```
This will start the development server and open the application in your default web browser. You can then start creating your visual novel. The explanation can be found further in the documentation.

## Quick Start

To create a visual novel, you can follow the example in the [`public/story/story.sample.json`](/public/story/story.sample.json) file. This file contains a sample story that you can use as a template for your own story. You can modify the file to create your own story. The file is in JSON format, so you can easily edit it with any text editor.

You can also create your own story from scratch by following the structure of the sample file with the name you want. You'll just have to update in the [`/src/App.tsx`](/src/App.tsx) file the name to your story file.

```tsx
<div id="app" className="centered">
    <VNPlayer scriptFile="Here goes the name of the file" />
</div>
```

Example:
```tsx
<div id="app" className="centered">
    <VNPlayer scriptFile="my_story.json" />
</div>
```

## Writing Your First Story
### Creating a Scene
### Adding Characters
### Writing Dialogue
### Adding Choices

## Running Locally
To run the application locally, follow the installation steps above and then start the development server with `npm run dev`. This will allow you to test your visual novel in a local environment.

## Deploying / Hosting
You can freely deploy your visual novel on any hosting platform that supports static sites, such as GitHub Pages, Netlify, or Vercel. Simply build the application using `npm run build` and then upload the contents of the `dist` folder to your hosting platform.

## Contributing
If you want to contribute to the project, you can fork the repository and create a pull request with your changes. We welcome contributions of all kinds, whether it's fixing bugs, adding new features, or improving the documentation.

## License
NamelessStory is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.