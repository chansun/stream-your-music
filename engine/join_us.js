


async function user_post(id, password, jwt) {    
    try {
        const result = await $.ajax({ 
            method: 'POST',
            url: 'http://localhost:3000/user/' + id,
            dataType: "json", // comment this out later
            ContentType: "application/json", // comment this out later
            // 수정 버전에서 되는거
            data: {
                id: id, 
                password: password, 
                jwt: jwt,
                title: ["title_temp1", "title_temp2"],
                videoId: ["videoId_temp1", "videoId_temp2"],
            },
            headers: {
                Authorization: `Bearer ${jwt}`,
            },

            // 기존 버전에서 되는거
            //data: {data: "테스트테스트"},
            //data: {data: "&&&" + title + "|||" + videoId + "%%%"},
        });
        return result;
    }
    catch (error) {
        console.log("user_post ajax threw an error!"); // comment this out later
    }
}


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


async function create_account(id, password) {
    console.log("create account");
    try {
        const result = await $.ajax({
            method: 'POST',
            url: 'http://localhost:3000/account/create',
            dataType: "json",
            ContentType: "application/json",
            data: {
                "name": id,
                "pass": password,
                /*
                "data": {
                    "role": 2,
                    "description": "Lazy..."
                }*/
            },
        });
        return result;
    }
    catch (error) {
        console.log("ajax threw an error!"); // comment this out later
        alert("There is alreay an existing account for the user name. Please try again.");
        $('#username').val("");
        $('#password').val("");
        $('#repeatPassword').val("");
    }
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
        console.log("sign_in ajax threw an error!"); // comment this out later
        alert("Login unsuccessful. Please try again.");
        $('#ID').val("");
        $('#password').val("");
    }
}

$(document).ready(function () {

    let id = "";
    let password = "";
    let password_repeat = "";

    $('#body').on('click', '.button', function (e) {
        // default behavior is refresh the page
        e.preventDefault();
        e.stopPropagation();
        //console.log(e.target);
        //var par = $(e.target).parent().parent().parent();
        var par = $(e.target).parent();
        let temp = par.serializeArray();
        id = temp[0].value;
        password = temp[1].value;
        password_repeat = temp[2].value;
        //console.log("ID: " + temp[0].value);
        //console.log("Password: " + temp[1].value);
        //console.log("Password_repeat: " + temp[2].value);
        if (password != password_repeat) {
            alert("Password does not match");
            $('#password').val("");
            $('#repeatPassword').val("");
        }
        else if (id == "" || password == "" || password_repeat == "") {
            alert("Please fill the box!");
        }
        else { // Please use chrome
            let response = create_account(id, password);
            response.then(function (value) {
                console.log(value);
                console.log(value['status']);
                alert("Account successfully created");
                //location.href= 'index.html';
                let response2 = sign_in(id, password);
                response2.then(function(result) {
                    let response3 = user_post(id, password, result['jwt']);
                    bake_cookie(id, password, result['jwt'], 10);
                    response3.then(function(value) {
                        console.log(value);
                        location.href= 'index_logged_in.html';
                    })
                });
            });
        }
    });
});

// id: chansun
// password: 123123