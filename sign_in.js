function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function bake_cookie(id, password, jwt, mins) {
    document.cookie = `id=${id}`;
    document.cookie = `password=${password}`;
    document.cookie = `jwt=${jwt}`;
    var d = new Date();
    d.setTime(d.getTime() + (mins*60*1000)); // 10 mins (600000 ms) cookie duration
    document.cookie = "expires="+ d.toUTCString(); // GMT base. Greenwich time zone.
}

async function sign_in(id, password) {
    try {
        const result = await $.ajax({
            method: 'POST',
            url: 'http://localhost:3000/account/login',
            dataType: "json", // comment this out later
            ContentType: "application/json", // comment this out later
            data: {    
                "name": id, 
                "pass": password
            },
        });
        return result;
    }
    catch (error) {
        console.log("sign_in ajax threw an error!");
        alert("Login unsuccessful. Please try again.");
        $('#ID').val("");
        $('#password').val("");
    }
}

async function get_status(jwt) {
    try {
        const result = await $.ajax({
            method: 'GET',
            url: 'http://localhost:3000/account/status',                
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return result;
    }
    catch (error) {
        console.log("get_status ajax threw an error!"); // comment this out later
        alert("Login unsuccessful. Please try again.");
        $('#ID').val("");
        $('#password').val("");
    }
}

$(document).ready(function () {
    let id = "";
    let password = "";

    $('#body').on('click', '.button', function (e) {
        // default behavior is refresh the page
        e.preventDefault();
        alert("This is a static version, so no backend service available.");
        /*
        var par = $(e.target).parent().parent().parent();
        let temp = par.serializeArray();
        id = temp[0].value;
        password = temp[1].value;
        if (id == "" || password == "") {
            alert("Please fill the box!");
        }
        else {
            let response = sign_in(id, password);
            response.then(function(result) {
                //console.log(result); // comment this out later
                //console.log(result['jwt']); // comment this out later
                let response2 = get_status(result['jwt']);
                response2.then(function(result2) {
                    //console.log(result2); // comment this out later
                    if (id == result2['user']['name']) {
                        //console.log("login successfull!");  // comment this out later
                        bake_cookie(id, password, result['jwt'], 10);
                        //console.log(document.cookie); // comment this out later
                        location.href= 'index_logged_in.html';
                    }
                });
            });
        }
        */
    })
    // id: chansun
    // password: 123123
});