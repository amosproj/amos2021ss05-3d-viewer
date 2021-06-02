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

- [Project Repository](#project-repository)
- [Bill of Material](#bill-of-material)


# Project Repository


## Github organisation structure

### base folder: [/main](https://github.com/amosproj/amos-ss2021-3d-viewer/find/main):

-   **/deliverables**:
    textual deliverables, i.e. documents (pdf, doc, etc.), or software deliverables


-   **/assets**:
    panaroma image dataset as an example to try the viewer software

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




You can find further details about the project in the associated documents.

1. [User Documentation](https://github.com/amosproj/amos-ss2021-3d-viewer/wiki/User-Documentation)
2. [Build/Deployment Documentation](https://github.com/amosproj/amos-ss2021-3d-viewer/wiki/Build--deploy-Documentation)
3. [Technical Documentation](https://github.com/amosproj/amos-ss2021-3d-viewer/wiki/Technical-Documentation)