"use strict";

export class ViewerFloorAPI {
   
    constructor(data, viewerAPI) {
        this.viewerAPI = viewerAPI;
        this.viewerImageAPI = viewerAPI.image;
        this.viewerMapAPI; // Set in MapAPI once created
        // The file «data.json» contains the metadata defining the panorama image locations.
            //"images" Array Images Array
            //"lon0" Number Reference longitude of model (WGS 84)
            //"lat0" Number Reference latitude of model (WGS 84)
            //"floors" Object Floors Object
        
        this.z; // : Number // Z coordinate of current floor(in meters)
        
        this.origin = [data.lon0, data.lat0]; // used in ViewerAPI:toLocal
        this.floors = [];

        // iterate over floors
        Object.keys(data.floors).forEach((key) => {
            const currentFloor = new ViewerFloor(data.floors[key], key);

            // add ViewerImages corresponding to this floor
            viewerAPI.image.images.forEach((currentImage) => {
                // check if imageidx in any of the i intervalls
                currentFloor.i.forEach((interval) => {
                    if (currentImage.id >= interval[0] && currentImage.id <= interval[1]) {
                        currentImage.floor = key;
                        
                        const [dx, dy] = [71.5 * (data.lon0 - currentImage.pos[0]), 111.3 * (data.lat0 - currentImage.pos[1])];

                        const offsetX = currentFloor.mapData.x + currentFloor.mapData.density * (dx * 1000);
                        const offsetY = currentFloor.mapData.y - currentFloor.mapData.density * (dy * 1000);

                        currentImage.mapOffset = [offsetX, offsetY];

                        currentFloor.viewerImages.push(currentImage);
                    }
                });
            });

            this.floors.push(currentFloor);            
        });

        //lowest floor will be at lowest index and highest floor at floors.length-1
        this.floors.sort((a, b) => (a.z > b.z) ? 1 : -1);

        this.currentFloorId = 0.0;
        viewerAPI.image.currentImageId = this.floors[this.currentFloorId].i[0][0];

        this.createControlMenuButtonsOL();
    }

    all(callback) {
        callback(this.floors);
    }

    get currentFloor() {
        return this.floors[this.currentFloorId];
    }

    set(name) {
        this.floors.forEach((element, index) => {
            // found the floor
            if (element.name == name) {
                const oldPos = this.viewerImageAPI.currentImage.pos;
                
                // set new floor 
                this.currentFloorId = index;

                // display pano from new floor closest to current one
                const newImg = this.viewerAPI.move(oldPos[0], oldPos[1], oldPos[2]); // only checks images in correct floor because FloorId is set before
                
                // // show new map
                // this.viewerMapAPI.redraw();

                // notify viewerAPI via event
                this.viewerAPI.propagateEvent("floor", this.currentFloor.name, true); // changed floor 
                this.viewerAPI.propagateEvent("moved", newImg.id, false); // moving to different pano is side-effect (not directly done by user)
                return;
            }
        });
    }
            
    createControlMenuButtonsOL() {

        $('button[name="buttonUp"]').hide();
        $('button[name="buttonDown"]').hide();
        $('.control select').hide();

        // Show current floor
        $("#cfOL").text("Current Floor: " + this.currentFloor.name + ". ");

        // push all floor names into an array
        let totalFloorsname = [];
        this.floors.forEach(function (item) {
            totalFloorsname.push(item.name);
        });

        // get buttonUp and buttonDown for enable/disable
        let buttonUp = document.getElementById('buttonUpOL');
        let buttonDown = document.getElementById('buttonDownOL');

        // get droplist
        var dropdownFloorsOL = document.getElementById("dropdown-floors-OL");
        
        // Checking if the current floor is on the highest or lowest floor
        if (this.floors.length == 1) {
            buttonDown.disabled = true;
            buttonUp.disabled = true;
        } else if (this.currentFloorId == 0) {
            buttonDown.disabled = true;
        } else if (this.currentFloorId == this.floors.length - 1) {
            buttonUp.disabled = true;
        }

        // Create Drop down Menus by floor names
        for(let i = 0; i < this.floors.length; i++) {
            var option = document.createElement('option');
            option.text = option.value = this.floors[i].name;
            dropdownFloorsOL.add(option, 0);
        }
        
        // reference needed for scope of $ functions
        const selfRef = this;

        // Change current floor by dropdown menu
        dropdownFloorsOL.onchange = function () {
            // conversion between currentFloorID with selfRef.floors.name
            let selectValue = dropdownFloorsOL.value;
            let index_in_floor_name = totalFloorsname.indexOf(selectValue);
            selfRef.currentFloorId = index_in_floor_name;
        
            $("#cfOL").text("Current Floor: " + selfRef.currentFloor.name + ". ");

            buttonUp.disabled = false;
            buttonDown.disabled = false;

            // Checking if the current floor is on the highest or lowest floor
            if (selfRef.currentFloorId == 0) {
                // lowest floor
                buttonDown.disabled = true;
                
            } else if (selfRef.currentFloorId == totalFloorsname.length - 1) {
                // highest floor
                buttonUp.disabled = true;
                
            }
            
            selfRef.set(dropdownFloorsOL.value);

            document.removeEventListener('pointermove', selfRef.viewerAPI.pano.oPM);
            document.removeEventListener('pointerup', selfRef.viewerAPI.pano.oPU);
        };

        //Up Button for changing currentfloor
        buttonUp.addEventListener('click', function () {
        
            selfRef.currentFloorId++;

            $("#cfOL").text("Current Floor: " + selfRef.currentFloor.name + ". ");

            // change to higher floor
            if (selfRef.currentFloorId == selfRef.floors.length - 1) {

                // disable the up button if it's already at the highest floor
                buttonUp.disabled = true;
                buttonDown.disabled = false;  

            } else {

                //enable the up button if it's not in the highest floor
                buttonUp.disabled = false;
                buttonDown.disabled = false; 

            }

            //$('.control select').val(viewerFloorAPI.currentFloorId).change();
            dropdownFloorsOL.value= totalFloorsname[selfRef.currentFloorId];

            selfRef.set(dropdownFloorsOL.value);

            document.removeEventListener('pointermove', selfRef.viewerAPI.pano.oPM);
            document.removeEventListener('pointerup', selfRef.viewerAPI.pano.oPU);

        });

        //Down Button for changing currentfloor
        buttonDown.addEventListener('click', function () {
        
            selfRef.currentFloorId--;
            $("#cfOL").text("Current Floor: " + selfRef.currentFloor.name + ". ");

            // change to lower floor
            if (selfRef.currentFloorId < 1 ) {

                // disable the down button if it's already at the lowest floor
                buttonUp.disabled = false; 
                buttonDown.disabled = true;

            } else {

                //enable the down button if it's not in the lowest floor
                buttonUp.disabled = false; 
                buttonDown.disabled = false;
                
            }

            //$('.control select').val(viewerFloorAPI.currentFloorId).change();
            dropdownFloorsOL.value= totalFloorsname[selfRef.currentFloorId];

            selfRef.set(dropdownFloorsOL.value);

            document.removeEventListener('pointermove', selfRef.viewerAPI.pano.oPM);
            document.removeEventListener('pointerup', selfRef.viewerAPI.pano.oPU);
        });
    }

}

class ViewerFloor {

    constructor(floorData, key) {
        this.name = key;
        this.z = floorData.z;
        this.viewerImages = [];
        this.mapData = floorData.map;
        this.i = floorData.i; // array of intervals, i.e. [ [1 , 3], [10, 12], [27, 30] ] means pictures {1,2,3,10,12,27,28,29,30} belong to this floor
    }

}
