// Get the image and insert it inside the modal - use its "alt" text as a caption

function _onclick(img, modal) {
    $(document).on('click', '#'+img, function(){$('#'+modal).modal('show')});
    $(document).keydown(function(e) {
      if (e.keyCode === 37) {
        $(".carousel-control-prev").click();
        return false;
      }
      if (e.keyCode === 39) {
        $(".carousel-control-next").click();
        return false;
      }
    });
}

function modal(id, modal) {
    /* Show the modal when the image is clicked

    Parameters
    ----------
    id: str
        str giving the id of the clicked image
    */
    var img = document.getElementById(id);
    /*img.onclick = _onclick(id);*/
    _onclick(id, modal)
}

function changeimage(id, mcmc_samples="False") {
    /* */
    var img = document.getElementById(id);
    var current_src = img.src;
    if ( mcmc_samples == "False" ) {
        if ( current_src.indexOf("posterior") >= 0 ) {
            img.src = current_src.replace("1d_posterior", "cdf");
        } else if ( current_src.indexOf("cdf") >= 0 ) {
            img.src = current_src.replace("cdf", "1d_posterior");
        }
    } else {
        if ( current_src.indexOf("combined") >= 0 ) {
            img.src = current_src.replace("_combined", "");
        } else if ( current_src.indexOf("posterior") >= 0 ) {
            img.src = current_src.slice(0, -4) + "_combined.png";
        }
    }
}
