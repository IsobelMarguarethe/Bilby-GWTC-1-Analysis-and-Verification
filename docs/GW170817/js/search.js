function mean(){                                                                
    var possible = ["mass1", "corner", "home"]                                  
    var el = document.getElementById("search")                                  
    var choices = []                                                            
    var i                                                                       
                                                                                
    for (i=0; i<3; i++) {                                                       
        var str = String(possible[i]);                                          
        var option = String(el.value);                                          
        var myReg = new RegExp(String(option).split(1,4) + ".*");               
        var myReg2 = new RegExp(String(option).split(-4, -1) + ".*");           
        var res = str.match(myReg);                                             
        var res2 = str.match(myReg2);                                                           
        if ( res !== null )                                                     
            choices.push(possible[i]);                                          
        else if ( res2 !== null )                                               
            choices.push(possible[i]);                                          
    }                                                                           
    return choices                                                              
}

function myFunction () {                                                        
  var el = document.getElementById("search");                                   
  var arr = ["mass1", "corner", "home"]                                     
        if ( arr.indexOf(el.value) !== -1 )                                     
            if ( el.value == "home" )                                           
            location.replace("https://geo2.arcca.cf.ac.uk/~c1737564/LVC/projects/bilby/GW150914/"+el.value+".html");
        else                                                                    
            location.replace("https://geo2.arcca.cf.ac.uk/~c1737564/LVC/projects/bilby/GW150914/html/"+el.value+".html");
  else
        alert("Invalid option. Do you mean:\n\n" + mean());                              
}
