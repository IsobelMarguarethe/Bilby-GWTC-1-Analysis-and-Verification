// Copyright (C) 2018  Charlie Hoy <charlie.hoy@ligo.org>
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation; either version 3 of the License, or (at your
// option) any later version.
//
// This program is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General
// Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

function _option1(label, approx, param) {
    /* Open a webpage that is of the form "./html/approx_param.html"

    Parameters
    ----------
    approx: str
        name of the approximant that you are analysing
    param: str
        name of the parameter that you wish to analyse
    home: bool
        if True, we are on the home page
    */
    if ( label == "None" ) {
        if ( approx == "None" ) {
            window.location = "./html/" + param+".html"
        } else {
            window.location = "./html/"+approx+"_"+param+".html"
        }
    } else {
        if ( approx == "None" ) {
            window.location = "./html/" + label + "_" + param+".html"
        } else {
            if ( approx == param ) {
                window.location = "./html/"+label+"_"+param+".html"
            } else {
                window.location = "./html/"+label+"_"+approx+"_"+param+".html"
            }
        }
    }
}

function _option2(label, approx, param) {
    /* Open a webpage that is of the form "./html/param.html"

    Parameters
    ----------
    param: str
        name of the parameter that you wish to analyse
    home: bool
        if True, we are on the home page
    */
    if ( label == "None" ) {
        if ( approx == "None" ) {
            window.location = "../html/" + param+".html"
        } else {
            window.location = "../html/"+approx+"_"+param+".html"
        }
    } else {
        if ( approx == "None" ) {
            window.location = "../html/" + label + "_" + param+".html"
        } else {
            if ( approx == param ) {
                window.location = "../html/"+label+"_"+param+".html"
            } else {
                window.location = "../html/"+label+"_"+approx+"_"+param+".html"
            }
        }
    }

}

function grab_html(param, label="None") {
    /* Return the url of a parameters home page for a given approximant

    Parameters
    ----------
    param: str
        name of the parameter that you want to link to
    */
    var header=document.getElementsByTagName("h1")[0]
    var el=document.getElementsByTagName("h7")[1]
    var approx = el.innerHTML
   
    if ( param == "bilby" ) {
        approx = "None" 
    }
    if ( param == "lalinference" ) {
        approx = "None" 
    }
 
    if ( approx == "Comparison" && param == "Comparison" ) {
        approx = "None"
    }
    
    var url = window.location.pathname
    var filename = url.substring(url.lastIndexOf('/')+1)
    if ( param == "home" ){
        if ( filename == "home.html" ) {
            window.location = "./home.html"
        } else {
            window.location = "../home.html"
        }
    }
    else if ( param == "Downloads" ) {
        if ( filename == "home.html" ) {
            window.location = "./html/Downloads.html"
        } else {
            window.location = "../html/Downloads.html"
        }
    }
    else if (param == "About") {
        if ( filename == "home.html" ) {
            window.location = "./html/About.html"
        } else {
            window.location = "../html/About.html"
        }
    }
    else if ( param == "Comparison" ) {
        if ( filename == "home.html" ) {
            window.location = "./html/Comparison.html"
        } else {
            window.location = "../html/Comparison.html"
        }
    }
    else if ( filename == "home.html" ) {
        _option1(label, approx, param)
    } else {
        _option2(label, approx, param)
   }
}
