// Copyright (C) 2018  Charlie Hoy <charlie.hoy@ligo.org>                          
// This program is free software; you can redistribute it and/or modify it      
// under the terms of the GNU General Public License as published by the        
// Free Software Foundation; either version 3 of the License, or (at your       
// option) any later version.                                                   
//                                                                              
// This program is distributed in the hope that it will be useful, but          
// WITHOUT ANY WARRANTY; without even the implied warranty of                   
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General   
// Public License for more details.                                             
//                                                                              
// You should have received a copy of the GNU General Public License along      
// with this program; if not, write to the Free Software Foundation, Inc.,      
// 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


function combine(list, label="None") {
      var loadTimer;
      var imgObject = new Image();
      var header=document.getElementsByTagName("h1")[0]
      var el=document.getElementsByTagName("h7")[1]
      var approx = el.innerHTML
      var c=document.getElementById("canvas")
      var ctx=c.getContext("2d")
      c.width=1000
      ctx.clearRect(0, 0, c.width, c.height);
      var el= document.getElementById("corner_search").value.split(", ");
      if ( typeof list === 'undefined' ) {
          list = 'None';
      }
      if ( list == 'None' ) {
        if ( el.length == 1 ) {                                                     
            var el = document.getElementById("corner_search").value.split(",");     
            if ( el.length == 1 ) {                                                 
                var el = document.getElementById("corner_search").value.split(" "); 
            }                                                                       
        }
      } else {
        var el = list.split(", ");
      }
      if ( el == "" ) {
          var el = [];
          var total = document.getElementsByName("type");
          var parameters = []
          for ( var i=0; i<total.length; i++ ) {
              parameters.push(total[i].id);
          }
          var ticked = [];
          for ( var i=0; i<parameters.length; i++ ) {
              if ( document.getElementById(parameters[i]).checked == true) {
                  el.push(parameters[i]);
              }
          }
      }

      function onImgLoaded(reject) {
          if (loadTimer != null) clearTimeout(loadTimer);
          if (!imgObject.complete) {
              loadTimer = setTimeout(function() {
                  onImgLoaded();
              }, 3);
          } else {
              try {
                  onPreloadComplete(c, imgObject, el, label);
              } catch (e) {
                  reject("Broken");
              }
          }
      }
      imgObject.src = '../plots/corner/'+label+'_all_density_plots.png';
      imgObject.onerror = function(){ window.location = "./error.html";}
      promise = new Promise((resolve, reject) => {
          imgObject.onload = () => onImgLoaded(reject)
      })
      promise.catch((err) => window.location = "./error.html")
      c.width = 0
      c.height = 0
}

function onPreloadComplete(c, imgObject, object, label){
    var newImg = getImagePortion(c, imgObject, object, label);
  
    //place image in appropriate div
    var link = document.getElementById("mirror")
    link.src = newImg
}

function getImagePortion(c, imgObj, array, label){
    /* the parameters: - the image element - the new width - the new height - the x point we start taking pixels - the y point we start taking pixels - the ratio */
    // set up canvas for thumbnail
    var tnCanvas = document.createElement('canvas');
    var tnCanvasContext = tnCanvas.getContext('2d');
    tnCanvas.width = 900; tnCanvas.height = 900;
    tnCanvasContext.fillStyle = "white";
    tnCanvasContext.fillRect(0, 0, 900, 900);
   
    /* use the sourceCanvas to duplicate the entire image. This step was crucial for iOS4 and under devices. Follow the link at the end of this post to see what happens when you don't do this */
    var bufferCanvas = document.createElement('canvas');
    var bufferContext = bufferCanvas.getContext('2d');
    bufferCanvas.width = imgObj.width;
    bufferCanvas.height = imgObj.height;
    bufferContext.drawImage(imgObj, 0, 0);

    var list = {}
    list['lalinference'] = ['a_1', 'a_2', 'luminosity_distance', 'lambda_1', 'lambda_2', 'mass_1', 'mass_2', 'tilt_1', 'tilt_2', 'chirp_mass', 'total_mass', 'symmetric_mass_ratio', 'mass_ratio', 'lambda_tilde', 'delta_lambda', 'redshift', 'mass_1_source', 'mass_2_source', 'total_mass_source', 'chirp_mass_source'];
    list['bilby'] = ['a_1', 'a_2', 'chi_eff', 'chi_p', 'chirp_mass', 'chirp_mass_source', 'dec', 'geocent_time', 'lambda_1', 'lambda_2', 'luminosity_distance', 'mass_1', 'mass_1_source', 'mass_2', 'mass_2_source', 'mass_ratio', 'phase', 'phi_12', 'phi_jl', 'psi', 'ra', 'symmetric_mass_ratio', 'tilt_1', 'tilt_2', 'total_mass', 'total_mass_source', 'iota', 'lambda_tilde', 'delta_lambda', 'redshift'];
    list['one'] = ['phase', 'phi_12', 'phi_jl', 'mass_ratio', 'geocent_time', 'ra', 'dec', 'luminosity_distance', 'psi', 'chirp_mass', 'a_1', 'a_2', 'tilt_1', 'tilt_2', 'mass_1', 'mass_2', 'total_mass', 'symmetric_mass_ratio', 'iota', 'chi_eff', 'chi_p', 'redshift', 'mass_1_source', 'mass_2_source', 'total_mass_source', 'chirp_mass_source'];
    var indices = []
    
    var ratio = (240*3) / (array.length*210)

    for ( var i=0; i<array.length; i++) {
        if ( list[label].indexOf(array[i]) == -1 ) {
            alert(                                       
                "The parameter '" + array[i] + "' is not recognised. Please open the " +
                "sidebar for a full list of available parameters")
        } else {
             indices[i] = list[label].indexOf(array[i])
        }
    }
    indices.sort((a,b) => a-b)

    var data = {}
    data['lalinference'] = {'width': 200.00000000000006, 'height': 200.0, 'seperation': 9.999999999999943, 'x0': 100.0, 'y0': 100.0};
    data['bilby'] = {'width': 200.00000000000006, 'height': 200.0, 'seperation': 9.999999999999943, 'x0': 100.0, 'y0': 100.0};
    data['one'] = {'width': 200.00000000000006, 'height': 200.0, 'seperation': 9.999999999999943, 'x0': 100.0, 'y0': 100.0};
    var imagewidth = data[label]["width"];
    var imageheight = data[label]["height"];
    var x0 = data[label]["x0"];
    var y0 = data[label]["y0"];
    var seperation = data[label]["seperation"];
    var offset = 30;
    for (var i=0; i<array.length; i++) {
        tnCanvasContext.drawImage(
            bufferCanvas, x0+(imagewidth+seperation)*indices[i],
            (y0 - 60) + (imageheight+seperation)*list[label].length,
            imagewidth, 80, imagewidth*i*ratio+160 + i*5,
            imageheight*array.length*ratio+offset + array.length*5,
            imagewidth*ratio, 80*ratio
        )
        for (var j=i; j<array.length; j++) {
           tnCanvasContext.drawImage(
                bufferCanvas, x0+(imagewidth+seperation)*indices[i],
                (y0 - 60) + (imageheight+seperation)*indices[j],
                imagewidth, imageheight, imagewidth*i*ratio+160 + i*5,
                imageheight*j*ratio+offset + j*5,
                imagewidth*ratio, imageheight*ratio)
        }
    }
    for (var i=1; i<array.length; i++) {
        tnCanvasContext.drawImage(
            bufferCanvas, 0, (y0 - 60) + (imageheight+seperation)*indices[i],
            x0, imageheight, 160 - x0*ratio, imageheight*i*ratio+i*5+offset,
            x0*ratio, imageheight*ratio
        )
    }
    return tnCanvas.toDataURL();
}
