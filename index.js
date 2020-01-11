async function public_userCount_get() {
    try {
        const result = await $.ajax({
            method: 'GET',
            url: 'http://localhost:3000/public/userCount',
        });
        return result;
    }
    catch (error) {
        console.log("public_userCount_get ajax threw an error!");
    }
}

async function public_userCount_post(userCount_num) {    
    try {
        const result = await $.ajax({
            method: 'POST',
            url: 'http://localhost:3000/public/userCount',
            data: {num: userCount_num},
        });
        return result;
    }
    catch (error) {
        console.log("public_userCount_post ajax threw an error!");
    }
}

async function public_post(title, videoId, current_num) {    
    try {
        const result = await $.ajax({ 
            method: 'POST',
            url: 'http://localhost:3000/public/users/user' + current_num,
            //dataType: "json", // comment this out later
            //ContentType: "application/json", // comment this out later
            data: {title: title, videoId: videoId}
        });
        return result;
    }
    catch (error) {
        console.log("public_post ajax threw an error!");
    }
}

/* Test
let response = public_post("Zion.T - ‘노래(THE SONG)’ M/V", "ecxzqqHwe-4");
response.then(function(result) {
    console.log(result); // comment this out later
});
*/

/* Test
async function public_get() {
    try {
        const result = await $.ajax({
            method: 'GET',
            url: 'http://localhost:3000/public/users',
        });
        return result;
    }
    catch (error) {
        console.log("public_authors ajax threw an error!"); // comment this out later
    }
}
*/

async function public_get2(current_num) {
    try {
        const result = await $.ajax({
            method: 'GET',
            url: 'http://localhost:3000/public/users/user' + current_num,
        });
        return result;
    }
    catch (error) {
        console.log("public_get2 ajax threw an error!");
    }
}

/* Static version, so lock these.
let userCount = public_userCount_get();
let current_num;
userCount.then(function(result) {
    current_num = parseInt(result['result']['num']) + 1;
    let response = public_post(["title_temp1", "title_temp2"], ["videoId_temp1", "videoId_temp2"], current_num);
    response.then(function(result) {
        console.log("===initialize===");
        console.log(result);
        console.log("===initialize===");
    });
    public_userCount_post(current_num);
});
*/

async function public_post_merge(title, videoId, current_num) {   
    let response2 = public_get2(current_num);
    response2.then(function(result) {
        let title_list = result['result']['title[]'];
        title_list.push(title);
        let videoId_list = result['result']['videoId[]'];
        videoId_list.push(videoId);
        let response = public_post(title_list, videoId_list, current_num);
        response.then(function(result) {
            console.log(result);
        });
    });
}

/* Test
setTimeout(function(){
    public_post_merge("title_temp3", "videoId_temp3", current_num);
}, 3000);
*/

async function public_delete(current_num) {
    try {
        const result = await $.ajax({
            method: 'DELETE',
            url: 'http://localhost:3000/public/users/user' + current_num,
        });
        return result;
    }
    catch (error) {
        console.log("public_delete ajax threw an error!");
    }
}

/* Test
setTimeout(function(){
    let public_del = public_delete(current_num);
    public_del.then(function(result) {
        console.log(result);
    });
}, 6000);*/

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
        console.log("Youtube_get threw an error!");
        alert("Youtube Data API quota runs out for today. Please try again tomorrow.")
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

    /* Tests
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

    /* ========= Only work with backend api =========
    let history_button = true;
    let history_title_once = true;
    $('#search_history').on('click', function(e) {
        if (history_button) {
            history_button = false;
            let response2 = public_get2(current_num);
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
    ======================= Only work with backend api ======================= */

    let music_history = []
    // ======================= Work without backend api (for static version) =======================
    let history_button = true;
    let history_title_once = true;
    $('#search_history').on('click', function(e) {
        if (history_button) {
            history_button = false;
            for (let i = 0; i < music_history.length; i++) {
                if (history_title_once) {
                    $('#search_history_here').css("visibility", "visible");
                    $('#search_history_here').append('<div class="title is-5" style="text-align: center;">Search History</div>');           
                    history_title_once = false;
                }
                let temp = music_history[i];
                let temp2 = `${temp}<br>`;
                $('#search_history_here').append(temp2);
            }
        }
        else {
            history_button = true;
            history_title_once = true;
            $('#search_history_here').css("visibility", "hidden");
            $('#search_history_here').html("");
        }
    })
    // ======================= Work without backend api (for static version) =======================

    $('.button').click('onclick', function(e) {
        if (video_ids.hasOwnProperty($(".input").val())) {
            music_history.push($(".input").val())
            //console.log(music_history);
            if (getCookie("currentSize") == 0) {
                bake_cookie(parseInt(getCookie("currentSize")) + 1, 10);
                $('#add_here').html(player_html($(".input").val(), video_ids[$(".input").val()]));
                $('#listHere').html(playerList_html($(".input").val()));
                onYouTubeIframeAPIReady();
                //console.log(document.cookie);
                count_hash[count] = [$(".input").val(), video_ids[$(".input").val()]];
                count += 1;
                now_playing[0] = $(".input").val();
                now_playing[1] = video_ids[$(".input").val()];
                public_post_merge($(".input").val(), video_ids[$(".input").val()], current_num);
                $(".input").val("");
            }
            else {
                bake_cookie(parseInt(getCookie("currentSize")) + 1, 10);
                $('#listHere').append(playerList_html($(".input").val()));
                //console.log(document.cookie);
                count_hash[count] = [$(".input").val(), video_ids[$(".input").val()]];
                count += 1;
                public_post_merge($(".input").val(), video_ids[$(".input").val()], current_num);
                $(".input").val("");
            }
        }
        else {
            alert("There is no matching music. Please search again.");
            $(".input").val("");
        }
    });
});