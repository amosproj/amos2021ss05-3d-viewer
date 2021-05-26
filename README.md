# A simply fabulous pano-based 3D-Viewer (AMOS SS 2021)

<p align="center">
    <img src="Deliverables/2021-04-20-Final-Logo.png" alt="Logo" width="600" height="230">
  </a>
</p>

This project is designed to enable the computer science department of the Friedrich-Alexander University Erlangen-Nuremberg to display its 50 years computer science department exhibition online.

The software to be developed shall be able to:

 &nbsp; ● View arbitrary rooms based on a 3D model\
 &nbsp; ● Allow users to walk through these rooms

## Properties

Functional properties of the software shall be:

&nbsp; &nbsp; ● The panorama shall be scalable (within a window)\
&nbsp; &nbsp; ● Users should be able to\
&nbsp; &nbsp; &nbsp;    ○ Rotate the panorama\
&nbsp; &nbsp; &nbsp;    ○ Walk through a room (switches panoramas)\
&nbsp; &nbsp; &nbsp;    ○ Switch between rooms\
&nbsp; &nbsp; &nbsp;    ○ Switch between floors (levels)\
&nbsp; &nbsp; ● A room layout including the user’s location shall be available
  
Non-functional properties of the software shall be:

&nbsp; &nbsp;   ● Runs in most common browsers (hence Javascript/Typescript)\
&nbsp; &nbsp;   ● Speedy non-frustrating interaction possible\
&nbsp; &nbsp;   ● Can be integrated into other web applications
  
The computer science department would like to use this viewer to display its 50 years of computer science department exhibition on the web.

# 3D Panorama Viewer | AMOS Project 5
## Software Build and Deployment Document

- [Introduction](#introduction)
- [Project Repository](#project-repository)
- [Bill of Material](#bill-of-material)
- [Build Process](#build-process)
  

# Introduction

The purpose of this Software was to create an easy, user-friendly 3D Panorama viewer which has different functions like zooming in, rotating, switching between panoramas. A map should also be included to enable the user to know their location whilst moving through the rooms/floors. This document provides information on how to build/deploy the 3D Panorama viewer.


# Project Repository


## Github organisation structure

### base folder: [/main](https://github.com/amosproj/amos-ss2021-3d-viewer/find/main):

-   **/deliverables**:
     textual deliverables, i.e. documents (pdf, doc, etc.), or software deliverables


-   **/assets**:
    manages URL generation and versioning of web assets such as CSS stylesheets, JavaScript files, and image files

-   **/src**:
    stands for source, and is the raw code before minification or concatenation or some other compilation - used to read/edit the code


-   **/gitignore**:
   is a text file that tells Git which files or folders to ignore in a project
   
   
-   **/license**:
    MIT License
    A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.
    

##  Folder Structure
### base folder: [/src](https://github.com/amosproj/amos-ss2021-3d-viewer/tree/main/src): Frontend

It includes css(inside PanoViewer div),js,libs and index.html

*  **/src/js/viewer**:
  includes the general viewer files
  
*  **/src/libs**:
  includes jQuery and Three.js Library files


## Folder Structure

### base folder: [/src](https://github.com/amosproj/amos-ss2021-3d-viewer/tree/main/src/js): Backend

Includes the js files and main.js



# Bill of Material

- [Node.js](https://nodejs.org/en/): JavaScript runtime environment Backend

- [the three.js NPM package](https://www.npmjs.com/package/three): JavaScript library and API for animated 3D graphics

- [WebGL Overview - The Khronos Group Inc](https://www.khronos.org/webgl/): JavaScript API for rendering interactive 2D and 3D graphics

- [License | jQuery Foundation](https://jquery.org/license/): JavaScript library for simple HTML DOM manipulation

- [org.w3c.dom (Java Platform SE 8 ](https://docs.oracle.com/javase/8/docs/api/org/w3c/dom/package-summary.html): Web APIs frontend for display Visualizations basics


# Build Process
## Setup and start the Frontend
  * As the software is written in web technologies (html, css and mostly javascript), the files will be delivered to the client end of users. 
  * There the browser will compile the javascript, link all the files together and render the final result in the browser window on the users monitor.
  

 You can find further details about the project in the associated documents.
1. [User Documentation](https://github.com/amosproj/amos-ss2021-3d-viewer/wiki/User-Documentation)
2. [Build/Deployment Documentation](https://github.com/amosproj/amos-ss2021-3d-viewer/wiki/Build--deploy-Documentation)
3. [Technical Documentation](https://github.com/amosproj/amos-ss2021-3d-viewer/wiki/Technical-Documentation)
