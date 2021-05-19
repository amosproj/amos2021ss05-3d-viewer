"use strict";

import { ViewerLibrary } from "./ViewerLibrary.js"
import { ViewerLibLicense } from "./ViewerLibLicense.js"

export function libraryInfo(){

    // three.js
    let Three_lic_name = 'MIT License';

    let Three_lic_text = ' \
    Copyright © 2010-2021 three.js authors \
    Permission is hereby granted, free of charge, to any person obtaining a copy\
    of this software and associated documentation files (the "Software"), to deal\
    in the Software without restriction, including without limitation the rights\
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\
    copies of the Software, and to permit persons to whom the Software is\
    furnished to do so, subject to the following conditions:\
    \
    The above copyright notice and this permission notice shall be included in\
    all copies or substantial portions of the Software.\
    \
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\
    THE SOFTWARE.\
    ';

    let Three_lic = new ViewerLibLicense(Three_lic_name,Three_lic_text);

    let Three_name = 'Three.js JavaScript 3D Library';

    let Three_text = '\
    Three.js is a cross-browser JavaScript library and application programming interface (API) used to create\
    and display animated 3D computer graphics in a web browser using WebGL.\
    Three.js allows the creation of graphical processing unit (GPU)-accelerated 3D animations\
    using the JavaScript language as part of a website without relying on proprietary browser plugins.\
    This is possible due to the advent of WebGL.\
    \
    from https://en.wikipedia.org/wiki/Three.js\
    ';

    let Three_url = 'https://threejs.org/';

    let viewerlibrary_Three = new ViewerLibrary(Three_lic,Three_name,Three_text,Three_url);

    // jQuery.js
    let jQuery_lic_name = 'MIT License';

    let jQuery_lic_text = '\
    Copyright OpenJS Foundation and other contributors, https://openjsf.org/\
    \
    Permission is hereby granted, free of charge, to any person obtaining\
    a copy of this software and associated documentation files (the\
    "Software"), to deal in the Software without restriction, including\
    without limitation the rights to use, copy, modify, merge, publish,\
    distribute, sublicense, and/or sell copies of the Software, and to\
    permit persons to whom the Software is furnished to do so, subject to\
    the following conditions:\
    \
    The above copyright notice and this permission notice shall be\
    included in all copies or substantial portions of the Software.\
    \
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,\
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND\
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE\
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION\
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\
    ';
    
    let jQuery_lic = new ViewerLibLicense(jQuery_lic_name,jQuery_lic_text);
    
    let jQuery_name = 'jQuery JavaScript Library';

    let jQuery_text = '\
    jQuery is a fast, small, and feature-rich JavaScript library.\
    It makes things like HTML document traversal and manipulation, event handling, animation,\
    and Ajax much simpler with an easy-to-use API that works across a multitude of browsers.\
    With a combination of versatility and extensibility, jQuery has changed the way that millions of people write JavaScript.\
    \
    from https://jquery.com\
    ';

    let jQuery_url = 'https://jquery.com/';

    let viewerlibrary_jQuery = new ViewerLibrary(jQuery_lic,jQuery_name,jQuery_text,jQuery_url);

    return [viewerlibrary_Three, viewerlibrary_jQuery];
}