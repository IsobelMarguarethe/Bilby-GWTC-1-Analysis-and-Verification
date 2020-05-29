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

function combines(list, label) {                                            
    var loadTimer;                                                              
    var imgObject = new Image();                                   
    var header=document.getElementsByTagName("h1")[0]
    var el=document.getElementsByTagName("h7")[1]
    var approx = el.innerHTML
    var c=document.getElementById("combines")                                     
    var ctx=c.getContext("2d")                                                
    ctx.clearRect(0, 0, c.width, c.height); 
    /*c.style.display = "none";  */                        
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
    c.width = 1350;
    if ( el == "" ) {
        var total = document.getElementsByName("type");
        var parameters = []
        for ( var i=0; i<total.length; i++ ) {
            parameters.push(total[i].id);
        }
        var ticked = [];
        parameters = parameters.filter(function(item, pos) {
                         return parameters.indexOf(item) == pos;
                      });
        for ( var i=0; i<parameters.length; i++ ) {
            if ( document.getElementById(parameters[i]).checked == true) {
                ticked.push(parameters[i]);
            }
        }
        var images2 = [];
        for ( var i=0; i<ticked.length; i++ ) {
            var newimage1 = new Image();
            var newimage2 = new Image();
            var newimage3 = new Image();
            var temp = [];
            if ( approx == "Comparison" ) {
                newimage1.src = '../plots/combined_1d_posterior_'+ticked[i]+'.png';
                newimage2.src = '../plots/combined_boxplot_'+ticked[i]+'.png';
                newimage3.src = '../plots/combined_cdf_'+ticked[i]+'.png';
            } else {
                newimage1.src = '../plots/'+label+'_1d_posterior_'+ticked[i]+'.png';
                newimage2.src = '../plots/'+label+'_autocorrelation_'+ticked[i]+'.png';
                newimage3.src = '../plots/'+label+'_sample_evolution_'+ticked[i]+'.png';
            }
            temp.push(newimage1);
            temp.push(newimage2);
            temp.push(newimage3);
            images2.push(temp);

            promise = new Promise((resolve, reject) => {
                onLoadImage(c, ctx, images2, reject, ticked)
            })
            promise.catch((err) => alert(
                "The parameter '" + err + "' is not recognised. Please open the " +
                "sidebar for a full list of available parameters"))
        }
    } else {                                                       
        var images = [];                                                                                 
        for ( var i=0; i<el.length; i++ ) { 
            var newimage1 = new Image();
            var newimage2 = new Image();
            var newimage3 = new Image();
            var temp = [];
            if ( approx == "Comparison" ) {
                newimage1.src = '../plots/combined_1d_posterior_'+el[i]+'.png'
                newimage2.src = '../plots/combined_boxplot_'+el[i]+'.png'
                newimage3.src = '../plots/combined_cdf_'+el[i]+'.png'
            } else {                                    
                newimage1.src = '../plots/'+label+'_1d_posterior_'+el[i]+'.png';
                newimage2.src = '../plots/'+label+'_autocorrelation_'+el[i]+'.png';
                newimage3.src = '../plots/'+label+'_sample_evolution_'+el[i]+'.png';
            }
            temp.push(newimage1);
            temp.push(newimage2);
            temp.push(newimage3);
            images.push(temp);
            
            promise = new Promise((resolve, reject) => {
                onLoadImage(c, ctx, images, reject, el)
            })
            promise.catch((err) => alert(
                "The parameter '" + err + "' is not recognised. Please open the " +
                "sidebar for a full list of available parameters"))
        }
    }
}

function onLoadImage(c, ctx, images, reject, list) {
    images[0][0].onload = function() {
        var width = this.naturalWidth;
        var height = this.naturalHeight;
        var scalefactor = 900 / width;
        var scalefactor2 = 450 / width;

        c.height = 580*images.length + 70*(images.length + 1) + 100*images.length
        setTimeout(function() {
        for ( var i=0; i<images.length; i++ ) {
            try {
                ctx.font = "35px Arial-body";
                ctx.fillText(list[i], 0, 580*i + ((i+1)*70) + i * 100 - 20);
                ctx.drawImage(images[i][0], 0, (580*i) + ((i+1)*70 + i * 100), 900, height * scalefactor);
                ctx.drawImage(images[i][1], 900, (580*i) + ((i+1)*70 + i * 100 + 350), 450, height * scalefactor2);
                ctx.drawImage(images[i][2], 900, (580*i) + ((i+1)*70 + i * 100), 450, height * scalefactor2);
                /*ctx.drawImage(images[i][0], 0, (400*i)+((i+1)*60 + 10), 900, height*scalefactor);*/
            } catch (e) {
                reject(list[i])
            }
        }
        }, 1000);
    }
    images[0].onerror = function() {
        reject(list[0]);
    }
}

/*
function plot(images, ctx, c) {
    for ( var i=0; i<images.length; i++ ) {
        ctx.drawImage(images[i], 0, (500*i)+(i*20), 700, 500);
    
    }
    c.style.display = "contents";
}
*/
