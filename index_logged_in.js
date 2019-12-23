async function private_get(jwt) {    
    try {
        const result = await $.ajax({ 
            method: 'GET',
            url: 'http://localhost:3000/private/users',
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return result;
    }
    catch (error) {
        console.log("private_get ajax threw an error!");
    }
}

async function private_post(title, jwt) {    
    try {
        const result = await $.ajax({ 
            method: 'POST',
            url: 'http://localhost:3000/private/users',
            //dataType: "json", // comment this out later
            //ContentType: "application/json", // comment this out later
            data: {title: title},
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return result;
    }
    catch (error) {
        console.log("private_post ajax threw an error!");
    }
}

async function private_post_merge(title, jwt) { 
    let private_get_test = private_get(jwt);
    private_get_test.then(function(value) {
        let temp = value['result']['title[]'];
        temp.push(title);
        private_post(temp, jwt);
    });
};

async function account_delete(id) {
    try {
        const result = await $.ajax({
            method: 'DELETE',
            url: 'http://localhost:3000/account/' + id,
        });
        return result;
    }
    catch (error) {
        console.log("account_delete ajax threw an error!");
    }
}

async function user_delete(id, jwt) {
    try {
        const result = await $.ajax({
            method: 'DELETE',
            url: 'http://localhost:3000/user/' + id,
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            
        });
        return result;
    }
    catch (error) {
        console.log("user_delete ajax threw an error!");
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

function bake_cookie(currentSize, mins) {
    document.cookie = `currentSize=${currentSize}`;
    var d = new Date();
    d.setTime(d.getTime() + (mins*60*1000)); // 10 mins (600000 ms) cookie duration
    document.cookie = "expires="+ d.toUTCString(); // GMT base. Greenwich time zone.
}
bake_cookie(0, 10);

async function user_get(id, jwt) {    
    try {
        const result = await $.ajax({ 
            method: 'GET',
            url: 'http://localhost:3000/user/' + id,
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return result;
    }
    catch (error) {
        console.log("user_get ajax threw an error!");
    }
}

async function user_post(id, password, jwt, title, videoId) {    
    try {
        const result = await $.ajax({ 
            method: 'POST',
            url: 'http://localhost:3000/user/' + id,
            //dataType: "json", // comment this out later
            //ContentType: "application/json", // comment this out later
            data: {
                id: id, 
                password: password, 
                jwt: jwt,
                title: title,
                videoId: videoId,
            },
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return result;
    }
    catch (error) {
        console.log("user_post ajax threw an error!");
    }
}

async function user_post_merge(id, password, jwt, title, videoId) {  
    let get_test = user_get(id, jwt);
    get_test.then(function(result) {
        let title_list = result['result']['title[]'];
        title_list.push(title);
        let videoId_list = result['result']['videoId[]'];
        videoId_list.push(videoId);
        let response = user_post(id, password, jwt, title_list, videoId_list);
        response.then(function(result) {
            console.log(result);
        });
    })
}

let temp_id = getCookie("id");
let temp_password = getCookie("password");
let temp_jwt = getCookie("jwt");

let count = 0;
let count_hash = {};
let now_playing = [];

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    $(`#${data}`).detach();
    bake_cookie(parseInt(getCookie("currentSize")) - 1, 10);
    if (getCookie("currentSize") == 0) {
        $('#add_here').html("");
        return 0;
    }
    // Only when the dropped song was in the player panel.
    if ((now_playing[0] == count_hash[data[8]][0]) && (now_playing[1] == count_hash[data[8]][1]))  {
        while ($('#listHere').children().first().is('script')) {
            $('#listHere').children().first().remove();
        }
        let title = count_hash[$('#listHere').children().first().attr('id')[8]][0];
        let videoId = count_hash[$('#listHere').children().first().attr('id')[8]][1];
        $('#titleHere').html('Now Playing: ' + title)
        $('#youtube-audio').attr("data-video", videoId);
        onYouTubeIframeAPIReady();
        now_playing[0] = title;
        now_playing[1] = videoId;
    }
}

async function Youtube_get(query) {
    try {
        const result = await $.ajax({
            method: 'GET',
            url: `https://www.googleapis.com/youtube/v3/search?q=${query}&part=snippet&key=AIzaSyB2r5glW1zie45HJzroGHoLz59MVosptNc&maxResults=1`,
            dataType: "json",
        });
        return result;
    }
    catch (error) {
        console.log("Youtube_get ajax threw an error!");
    }
}

function sign_in_handler(e) {
    location.href= 'sign_in.html';
}

function join_us_handler(e) {
    location.href= 'join_us.html';
}

function player_html(title, videoId) { // videoId e.g., tq1HB3xLctc
    let player_html = `
        <br>
        <div id="playertop" style="display:flex;justify-content:flex-start;align-items:center;">
            <div id="playerBottom">
                <div data-video="${videoId}" data-autoplay="0" data-loop="1" id="youtube-audio"></div>
                <div style="clear:both;margin:10px;text-align:center">
                </div>
            </div>
            <div id="playerPlaying">
                <span id="titleHere" class="title is-4">
                    Now Playing: ${title}
                </span>
            </div>
        </div>
        <div id="playerbottom">
            <div style="text-align: center;">
            <span class="title is-5">Play List</span>
            </div>
            <br>
            <div id="listHere">
            </div>
        </div>`;
    return player_html;
}

function playerList_html(title) { // videoId e.g., tq1HB3xLctc
    let internal_number = count;
    let temp_title = title;
    let playerList_html = `
        <div id="playList${internal_number}" draggable="true" ondragstart="drag(event)">
            <span class="clickable">${temp_title}</span>
        </div>
        <script>
            $('#playList${internal_number}').bind('click keyup', function(e) {
                let title = count_hash[${internal_number}][0];
                let videoId = count_hash[${internal_number}][1];
                $('#titleHere').html('Now Playing: ' + title)
                $('#youtube-audio').attr("data-video", videoId);
                onYouTubeIframeAPIReady();
                now_playing[0] = title;
                now_playing[1] = videoId;
                console.log(now_playing);
            });
        </script>
        `;
    return playerList_html;
}

$(document).ready(function () {    
    let hot_button = true;    
    $('#hot_songs').on('click', function(e) {
        if (hot_button) {
            hot_button = false;
            let top_dict = {};
            let private_response = private_get(temp_jwt);
            private_response.then(function(value) {
                let temp = value['result']['title[]'];
                for (let i = 2; i < temp.length; i++) {
                    if (!(temp[i] in top_dict)) {
                        top_dict[temp[i]] = 1;
                    }
                    else {
                        top_dict[temp[i]] +=1 ;
                    }
                }
                keysSorted = Object.keys(top_dict).sort(function(b, a){return top_dict[a]-top_dict[b]});
                if (keysSorted.length >= 5) {
                    $('#hot_above').append("<br>");
                    $('#history_above').append("<br>");
                    $('#hot_songs_here').css("visibility", "visible");
                    let temp2 = `<div class="title is-5" style="text-align: center;">Hot Songs</div>`;
                    $('#hot_songs_here').append(temp2);
                    for (let i = 0; i < 5; i++) {
                        let temp3 = `${keysSorted[i]}<br>`;
                        $('#hot_songs_here').append(temp3);
                    }
                }
            });
        }
        else {
            hot_button = true;
            $('#hot_above').html("");
            $('#history_above').html("");
            $('#hot_songs_here').css("visibility", "hidden");
            $('#hot_songs_here').html("");
        }
    });
    
    /* Test
    let top_dict = {};
    let private_response = private_get(temp_jwt);
    private_response.then(function(value) {
        let temp = value['result']['title[]'];
        for (let i = 2; i < temp.length; i++) {
            if (!(temp[i] in top_dict)) {
                top_dict[temp[i]] = 1;
            }
            else {
                top_dict[temp[i]] +=1 ;
            }
        }
        keysSorted = Object.keys(top_dict).sort(function(b, a){return top_dict[a]-top_dict[b]});
        //console.log(keysSorted);
        //console.log(top_dict);
        if (keysSorted.length >= 5) {
            $('#hot_songs').css("visibility", "visible");
            let temp2 = `<div class="title is-5" style="text-align: center;">Hot Songs</div>`;
            $('#hot_songs').append(temp2);
            for (let i = 0; i < 5; i++) {
                let temp3 = `${keysSorted[i]}<br>`;
                $('#hot_songs').append(temp3);
            }
        }
    });
    */

    $('#logout').on('click', function(e) {
        location.href= 'index.html';
    })
    $('#sign_in').on('click', sign_in_handler);
    $('#join_us').on('click', join_us_handler);

    let timeout;
    let video_ids = {};

    $('input').on('keyup', function(e) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            let temp = Youtube_get($(".input").val());
            temp.then(function(result) {
                let array = [result['items'][0]['snippet']['title']];
                video_ids[result['items'][0]['snippet']['title']] = result['items'][0]['id']['videoId'];
                $("#search").autocomplete({
                    source: array,
                });
                if ((e.keyCode != 37) && (e.keyCode != 38) && (e.keyCode != 39) && (e.keyCode != 40) && (e.keyCode != 13) && (e.keyCode != 32) && (e.keyCode != 8) && (e.keyCode != 18) && (e.keyCode != 91) && (e.keyCode != 16)) {
                    $("#search").autocomplete( "search", " " );
                }
            });
        }, 500);
    });

    // On 'keyup', execute onYouTubeIframeAPIReady().
    let onYouTubeIframeAPIReady;
    $('input').on('keyup', function(e) {
        var player;
        onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
            var ctrlq = document.getElementById("youtube-audio");
            ctrlq.innerHTML = '<img id="youtube-icon" src=""><div id="youtube-player"></div>';
            ctrlq.style.cssText = 'width:100px;margin:1.5em auto;cursor:pointer;cursor:hand;display:none';
            ctrlq.onclick = toggleAudio;

            player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: ctrlq.dataset.video,
            playerVars: {
                autoplay: ctrlq.dataset.autoplay,
                loop: ctrlq.dataset.loop,
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange 
            } 
            });
        } 
        function togglePlayButton(play) {    
            document.getElementById("youtube-icon").src = play ? "https://i.imgur.com/IDzX9gL.png" : "https://i.imgur.com/quyUPXN.png";
        }
        function toggleAudio() {
            if ( player.getPlayerState() == 1 || player.getPlayerState() == 3 ) {
            player.pauseVideo(); 
            togglePlayButton(false);
            } else {
            player.playVideo(); 
            togglePlayButton(true);
            } 
        } 
        function onPlayerReady(event) {
            player.setPlaybackQuality("small");
            document.getElementById("youtube-audio").style.display = "block";
            togglePlayButton(player.getPlayerState() !== 5);
        }
        function onPlayerStateChange(event) {
            if (event.data === 0) {
            togglePlayButton(false); 
            }
        }
    });

    /* Test
    video_ids["[MV] JANNABI(잔나비) _ Good Boy Twist"] = "twIUeUkEyks";
    video_ids["MIKA - 'Big Girl' (Live on Late Night with Seth Meyers / 2019)"] = "kTLT9E1nmtQ";
    video_ids["busted year 3000"] = "o07HhMFUSv0";
    video_ids["Zion.T - ‘노래(THE SONG)’ M/V"] = "ecxzqqHwe-4";
    video_ids["Mika - Dear Jealousy"] = "5AbE5M6tHLk";
    video_ids["[2012.05.15] 프라이머리(Primary) - 만나 Feat. 자이언티(Zion.T) Live"] = "WqP6OFzYoa0";
    let array = ["[MV] JANNABI(잔나비) _ Good Boy Twist", "MIKA - 'Big Girl' (Live on Late Night with Seth Meyers / 2019)", "busted year 3000", "Zion.T - ‘노래(THE SONG)’ M/V", "Mika - Dear Jealousy", "[2012.05.15] 프라이머리(Primary) - 만나 Feat. 자이언티(Zion.T) Live"];
    $("#search").autocomplete({
        source: array,
        autoFocus: true,
    });
    $('input').on('keyup', function(e) {
        if ((e.keyCode != 37) && (e.keyCode != 38) && (e.keyCode != 39) && (e.keyCode != 40) && (e.keyCode != 13) && (e.keyCode != 32) && (e.keyCode != 8) && (e.keyCode != 18) && (e.keyCode != 91) && (e.keyCode != 16)) {
            $("#search").autocomplete( "search", " " );
        }
    });
    */
    
    $('#delete_account').on('click', function(e) {
        alert("Delete account");
        let response1 = account_delete(temp_id);
        response1.then(function(value) {
            let response2 = user_delete(temp_id, temp_jwt);
            response2.then(function(value2) {
                location.href= 'index.html';
            })
        })
    });

    let history_button = true;
    let history_title_once = true;
    $('#search_history').on('click', function(e) {
        if (history_button) {
            history_button = false;
            let response2 = user_get(temp_id, temp_jwt);
            response2.then(function(result) {
                let title_list = result['result']['title[]'];
                for (let i = 2; i < title_list.length; i++) {
                    if (history_title_once) {
                        $('#search_history_here').css("visibility", "visible");
                        $('#search_history_here').append('<div class="title is-5" style="text-align: center;">Search History</div>');           
                        history_title_once = false;
                    }
                    let temp = title_list[i];
                    let temp2 = `${temp}<br>`;
                    $('#search_history_here').append(temp2);
                }
            });
        }
        else {
            history_button = true;
            history_title_once = true;
            $('#search_history_here').css("visibility", "hidden");
            $('#search_history_here').html("");
        }
    })

    $('.button').click('onclick', function(e) {
        if (video_ids.hasOwnProperty($(".input").val())) {
            if (getCookie("currentSize") == 0) {
                bake_cookie(parseInt(getCookie("currentSize")) + 1, 10);
                $('#add_here').html(player_html($(".input").val(), video_ids[$(".input").val()]));
                $('#listHere').html(playerList_html($(".input").val()));
                onYouTubeIframeAPIReady();
                count_hash[count] = [$(".input").val(), video_ids[$(".input").val()]];
                count += 1;
                now_playing[0] = $(".input").val();
                now_playing[1] = video_ids[$(".input").val()];
                user_post_merge(temp_id, temp_password, temp_jwt, $(".input").val(), video_ids[$(".input").val()]);
                private_post_merge($(".input").val(), temp_jwt);
                $(".input").val("");
            }
            else {
                bake_cookie(parseInt(getCookie("currentSize")) + 1, 10);
                $('#listHere').append(playerList_html($(".input").val()));
                count_hash[count] = [$(".input").val(), video_ids[$(".input").val()]];
                count += 1;
                user_post_merge(temp_id, temp_password, temp_jwt, $(".input").val(), video_ids[$(".input").val()]);
                private_post_merge($(".input").val(), temp_jwt);
                $(".input").val("");
            }
        }
        else {
            alert("There is no matching music. Please search again.");
            $(".input").val("");
        }
    });
});