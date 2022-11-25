// ==UserScript==
// @name         Erome Video Cloner
// @namespace    http://tampermonkey.net/
// @version      0.9.424
// @description  clone videos in an erome album, play multiple & side-by-side!
// @author       throwinglove23
// @license      MIT
// @match        https://www.erome.com/a/*
// @match        http://www.erome.com/a/*
// @match        https://www.erome.com/*
// @exclude      http://www.erome.com/a/*/edit
// @exclude      https://www.erome.com/a/*/edit
// @icon         https://www.erome.com/favicon-32x32.png
// @grant        none
// ==/UserScript==
/* jshint esversion: 8 */ 

function mainFunction() {
    'use strict';
    // removing default seek functions
    document.onkeydown = null;
    window.addEventListener('keydown', function(e) {
        // avoiding space which scrolls down to allow pausing
      if(e.keyCode == 32) {
          
        e.preventDefault();
      }
});
    const userRow = document.querySelector('.username');
    const cleanseBtn = document.createElement('button');
    if (userRow == null || document.querySelector('video') == null)
    {
        return;
    }
    cleanseBtn.classList.add('btn', 'btn-grey', 'btn-sm', 'url-btn');
    cleanseBtn.textContent = 'SHOW URLS';
    userRow.appendChild(cleanseBtn);
    cleanseBtn.addEventListener('click', urlShow);
    if (document.querySelectorAll('.video').length>0)
    {
        const infoRow = document.querySelector('.user-info.text-right');
        const spanItem = document.createElement('span');
        //spanItem.classList.add('btn', 'mr-5', 'btn-grey', 'cloner');
        const cloneIcon = document.createElement('i');
        if (document.querySelectorAll('#legend a').length > 0)
            {
                const legendBtn = document.createElement('a');
                legendBtn.classList.add('btn', 'btn-grey', 'btn-sm', 'mr-5');
                legendBtn.href='#legend';
                legendBtn.textContent = 'GO TO LEGEND';
                spanItem.append(legendBtn);
            }
        infoRow.insertBefore(spanItem, infoRow.firstElementChild);
    
        //spanItem.addEventListener('click', cloneFunction);
    }
    // adding transitions to legend links if exists
    replaceAdWithButtons();

    // Your code here...
}

function copySourceFromAlbum()
{
    const albums = Array.from(document.getElementsByClassName('album'));
    albums.forEach(async function(album)
        {
            const hr = album.querySelector('.album-link').href;
            const hdr = await fetch(hr);
            const data = await hdr.text();
            var parser = new DOMParser();
            var doc = parser.parseFromString(data, 'text/html');
            album.querySelector('.album-thumbnail').style.objectFit = 'cover';
            album.style.maxHeight = '200px';
            if (doc.querySelector('source') == null)
            {
                return;
            }
            const vidSrc = doc.querySelector('source').src;
            async function copyFxn()
            {
                await navigator.clipboard.writeText(vidSrc);
            }
            album.insertAdjacentHTML("afterbegin", '<button class="copy-link-btn btn btn-sm btn-pink" style="margin-left: 2px;width: fit-content;position: relative;z-index: 30;bottom: 61px;font-size: 1.5rem;padding: 0;">COPY</button>');
            album.querySelector('.copy-link-btn').onclick = copyFxn;
        });
}

function urlShow()
{
    if (document.querySelector('video') == null)
    {
        return;
    }
    const urlBtn = document.querySelector('.url-btn');
    urlBtn.textContent == 'SHOW URLS' ? urlBtn.textContent = 'HIDE URLS': urlBtn.textContent = 'SHOW URLS';
    const vids = document.querySelectorAll('.video');
    if (document.querySelector('.form-url') == null)
    {
        const area = document.querySelector('.clearfix').previousElementSibling.parentElement;
        area.insertAdjacentHTML("afterbegin", "<form class='form-url hidden'><input type='url' required id='video-input' style='width:430px' placeholder='enter video url(s) separated by comma ,'><button class='btn btn-sm btn-pink btn-add-url'>ADD</button></form>");
        const form = document.querySelector('.form-url').addEventListener('submit', function(e)
               {
                    e.preventDefault();
                });
        const btn = document.querySelector('.btn-add-url');
        btn.addEventListener('click', addVideo);
    }
    vids.forEach(vid =>
    {
        const src = vid.querySelector('video').firstElementChild.src;
        if (vid.firstChild.tagName != 'A')
        {
            const anc = document.createElement('a');
            anc.classList.add('video-url', 'hidden');
            anc.textContent = 'COPY LINK';
            vid.insertAdjacentElement("afterbegin", anc);
            anc.onclick = async function()
            {
                await navigator.clipboard.writeText(src);
            };
        }
    });

    function addVideo()
        {
            const input = document.getElementById('video-input');

            if (input.value == '' || input.value.length < 50 || input.value == null)
            {
                console.log("no valid input");
                return;
            }
            else
            {
                let vidURLs = input.value.split(',');
                vidURLs.forEach(url => createVid(url));
            }
        }

    function createVid(sourceURL)
        {
            let posterURL1 = sourceURL.replace('v', 's');
            let posterURL2 = posterURL1.replace('_720p', '');
            let posterURL = posterURL2.replace('mp4', 'jpg');
            const mediaDiv = document.createElement('div');
            const videoDiv = document.createElement('div');
            mediaDiv.classList.add('media-group');
            videoDiv.classList.add('video');
   
            const mainMedia = document.querySelector('.media-group');
            mainMedia.parentElement.appendChild(mediaDiv);
            mediaDiv.appendChild(videoDiv);
            const video = document.createElement('video');
            video.classList.add('video-js', 'vjs-16-9');
            video.controls = true;
            video.poster = posterURL;
       
            const src = document.createElement('source');
            src.setAttribute('src', sourceURL);
            video.appendChild(src);
            videoDiv.appendChild(video);
            var player = videojs(video);
            video.preload="none";
            allowPToPause(video);


            document.querySelector('.sidebyside-btn').click();
            document.querySelector('.sidebyside-btn').click();
        }


    if (urlBtn.textContent == 'SHOW URLS')
    {
        const links = document.querySelectorAll('.video-url');
        links.forEach(anc =>
        {
            anc.classList.add('hidden');
        });
    }
    else
    {
        const links = document.querySelectorAll('.video-url');
        links.forEach(anc =>
        {
            anc.classList.remove('hidden');
        });
    }
    document.querySelector('.form-url').classList.toggle('hidden');
                                                
}


function addTransitionToID()
{
    const legendLinks = document.querySelectorAll('#legend a');
    legendLinks.forEach(link => 
    {
            const idText = link.textContent.trim();
            const parsedInt = parseInt(idText.substring(1), 10);
            const textInLink = link.nextSibling;
            const idEl = document.getElementById(parsedInt);
            if (textInLink.nodeType == 3)
            {
                idEl.title=textInLink.textContent.trim();
            }
    });
    legendLinks.forEach(link => link.onclick= function() 
        {
            const idText = link.textContent.trim();
            const parsedInt = parseInt(idText.substring(1), 10);
            const idEl = document.getElementById(parsedInt);
            if (!Number.isNaN(parsedInt))
            {
                link.href=`#${parsedInt}`;
            }
            idEl.style.transition = 'all 0.3s ease-in-out';
            idEl.style.opacity = '0.4';
            function backTo(elem)
                {
                    elem.style.opacity='1';
                }
            setTimeout(backTo, 400, idEl);
        });
}

function addProperID()
{
    let count = 0;
    document.querySelectorAll('.media-group img.img-front, .media-group video').forEach
    (item => 
        {
            count++;
            item.closest('.media-group').removeAttribute('id');
            item.closest('.media-group').id=count;
        }
    );
}

function playerSeekables()
{
    var btn = document.createElement('button');
    var backwardIcon = document.createElement('i');
    backwardIcon.classList.add('fas', 'fa-forward', 'fa-flip-horizontal');
    btn.append(backwardIcon);
    btn.title = "Back 10 seconds";
    btn.addEventListener('click', seekNeg);
        function seekNeg()
        {
            this.closest('.video').querySelector('video').currentTime -= 10;
        }
    function seekPos()
        {
            this.closest('.video').querySelector('video').currentTime += 10;
        }
    var btn2 = document.createElement('button');
    var forwardIcon = document.createElement('i');
    forwardIcon.classList.add('fas', 'fa-forward');
    btn2.append(forwardIcon);
    btn2.title = 'Forward 10 seconds';
    btn2.onclick = seekPos;
    var flipIcon = document.createElement('i');
    flipIcon.classList.add('fas','fa-sort', 'fa-rotate-90', 'fa-2x', 'ml-10');
    const flipBtn = document.createElement('button');
    flipBtn.append(flipIcon);
    flipBtn.classList.add('mirror-btn');
    flipBtn.onclick = flip;

    return {btn, btn2, flipBtn};
   
}

function flip()
        {
            let flipper = this.closest('.mirror-btn');
            if (this.closest('.mirror-btn').classList.contains('flipped'))
                {
                    this.closest('.video').querySelector('video').style.transform = '';
                    flipper.classList.toggle('flipped');
                    return;
                }
            this.closest('.video').querySelector('video').style.transform = 'rotateY(170deg)';
            flipper.classList.add('flipped');
        }

function replaceAdWithButtons()
{
    const ad = document.getElementById('bubble');
    ad.removeAttribute('href');
    ad.textContent = '';
    ad.style.display='block';
    const sbsBtn = document.createElement('button');
    sbsBtn.textContent = 'SBS: OFF';
    const clonerBtn = document.createElement('button');
    clonerBtn.textContent = 'CLONER: OFF';
    sbsBtn.classList.add('btn', 'btn-sm', 'btn-pink', 'sidebyside-btn', 'mr-5');
    clonerBtn.classList.add('btn', 'btn-sm', 'btn-pink', 'cloner');
    sbsBtn.addEventListener('click', sideBySide);
    clonerBtn.addEventListener('click', cloneFunction);
    
    ad.append(sbsBtn, clonerBtn);
}

function allowPToPause(videoToAllow)
{
    videoToAllow.parentElement.onkeydown = function(event){
        if(event.key == 'p' || event.key == ' ')
        {
            videoToAllow.parentElement.querySelector('.vjs-play-control').click();
        }
        else if (event.key == 'ArrowRight')
        {
            videoToAllow.currentTime+=10;
        }
        else if (event.key == 'ArrowLeft')
        {
            videoToAllow.currentTime-=10;
        }
        else if (event.key == 'r')
        {
            const rng = Math.random() * (videoToAllow.duration - 1);
            videoToAllow.currentTime = rng;
        }
        else if (event.key == 'm')
        {
            videoToAllow.parentElement.querySelector('.mirror-btn').click();
        }
        else if (event.key == 'f')
        {
            videoToAllow.parentElement.querySelector('.vjs-fullscreen-control').click();
        }
        else if (!isNaN(event.key) && event.key != ' ')
        {
            videoToAllow.currentTime = (videoToAllow.duration/10) * (event.key);
        }
        else if (event.key == 'z')
        {
            if (!videoToAllow.classList.contains('zoomed'))
            {
                videoToAllow.style.scale = 2;
            }
            else
            {
                videoToAllow.style.scale= 1;
            }
            videoToAllow.classList.toggle('zoomed');
        }
    };
}

function playerVersion(data)
{
        const mediaDiv = document.createElement('div');
        const videoDiv = document.createElement('div');
        mediaDiv.classList.add('media-group');
        videoDiv.classList.add('video');

        const mainMedia = document.querySelector('.media-group');
        mainMedia.parentElement.appendChild(mediaDiv);
        mediaDiv.appendChild(videoDiv);
        const video = document.createElement('video');
        video.classList.add('video-js', 'vjs-16-9');
        video.controls = true;
        video.poster=data.bi;
    
        const src = document.createElement('source');
        src.setAttribute('src', data.urL);
        video.appendChild(src);
        videoDiv.appendChild(video);
        var player = videojs(video);
        video.preload="none";
        
        let btn = playerSeekables().btn;
        let btn2 = playerSeekables().btn2;
        let flipper = playerSeekables().flipBtn;
        mediaDiv.querySelector('.vjs-control-bar').insertAdjacentElement("afterbegin", btn);
        mediaDiv.querySelector('.vjs-play-control').insertAdjacentElement("afterend", btn2);
        mediaDiv.querySelector('.vjs-fullscreen-control').insertAdjacentElement("beforebegin", flipper);
        
        allowPToPause(video);
}

function getVidData(vidDiv)
{
    const urL = vidDiv.querySelector('.video video source').src;
    var img = vidDiv.querySelector('.vjs-poster');
    var bi = img.style.backgroundImage.slice(4, -1).replace(/"/g, "");
    
    return {urL, bi};
}
// remove original videos and get their poster+vid url
function removeWithData(vidDiv)
{
    let data = getVidData(vidDiv);
    vidDiv.remove();
    return data;
}

function videoCleanseReplace()
{
    const vidDivs = document.getElementsByClassName('video');
    console.log("started cleansing");
    Array.from(vidDivs).forEach(vidDiv =>
    {
        let data = removeWithData(vidDiv);
        playerVersion(data);
    });
    //showing message on load
    const messageDiv = document.querySelector('#user_message');
    messageDiv.textContent = 'videos replaced';
    setTimeout(() => {
        messageDiv.style.display='none';
    }, 5000);
    // deleting empty first video section
     Array.from(document.querySelectorAll('.video-lg')).forEach(lgVid => lgVid.parentElement.remove());
    
    
}

function sideBySide()
{
    if (document.querySelectorAll('.media-group.col-sm-6').length > 0)
    {
        const sideVideos = Array.from(document.querySelectorAll('.media-group.col-sm-6'));
        sideVideos.forEach(group => 
        {
            group.classList.remove('col-sm-6');
        });
        document.querySelector('a .sidebyside-btn').textContent = 'SBS: OFF';
    }
    else
    {
        const sideVideos = Array.from(document.querySelectorAll('.media-group.col-sm-6'));
        sideVideos.forEach(group => 
        {
            group.classList.remove('col-sm-6');
        });
        const groups = Array.from(document.querySelectorAll('.media-group'));
        groups.forEach(group => 
        {
           group.classList.add('col-sm-6');
        });
        document.querySelector('a .sidebyside-btn').textContent = 'SBS: ON';
        
    }
}

function showMessage()
{
    const messageDiv = document.querySelector('#user_message');
    messageDiv.textContent = 'videos replaced + multi-play ON';
    messageDiv.style.display='block';
    messageDiv.style.width="400px";
    setTimeout(() => {
        messageDiv.style.display='none';
        messageDiv.style.width="200px";
    }, 1500);
}

// adding clone button to each video
function cloneFunction()
{
    if (document.querySelector('.video video') == null)
    {
        console.log("no videos");
        return;
    }
    // pressing button again up top should clear the clone buttons if second time pressing it
    if (document.getElementsByClassName('clone-btn').length > 0)
    {
        const allButtons = document.querySelectorAll('.clone-btn');
        allButtons.forEach(button => button.remove());
        document.querySelector('a .cloner').textContent = 'CLONER: OFF';
        return;
    }
    const videoDivs = document.querySelectorAll('.video');
    videoDivs.forEach(videoDiv => 
    {
        const cloneBtn = document.createElement('button');
        cloneBtn.style.position = 'absolute';
        cloneBtn.style.top = '0px';
        cloneBtn.style.zIndex = 1;
        cloneBtn.style.left="94.75%";
        if (videoDiv.parentElement.classList.contains('col-sm-6'))
        {
            cloneBtn.style.left="89%";
        }
        cloneBtn.style.transition = 'all 0.6s ease-in-out';
        cloneBtn.style.opacity=0;
        cloneBtn.classList.add('btn','btn-sm','btn-default','clone-btn');
        cloneBtn.textContent = 'CLONE';
        
        videoDiv.addEventListener('mouseover', function()
                        {
                            cloneBtn.style.opacity=1;
                        });
        videoDiv.addEventListener('mouseout', function()
                        {
                                cloneBtn.style.opacity = 0;
                        });
        
        videoDiv.insertBefore(cloneBtn, videoDiv.firstElementChild);
        cloneBtn.onclick = cloneThis;
    });
    document.querySelector('a .cloner').textContent = 'CLONER: ON';
}

function cloneThis()
{
    
    if (document.querySelector('.video video') == null)
    {
        console.log("no videos");
        return;
    }
    else
    {
        const videoDivData = this.parentElement;
        let data = getVidData(videoDivData);
        const videoOriginal = videoDivData.querySelector('video');
        
        
        const mediaDiv = document.createElement('div');
        const videoDiv = document.createElement('div');
        mediaDiv.classList.add('media-group');
        if (videoOriginal.closest('.media-group').classList.contains('col-sm-6'))
        {
            mediaDiv.classList.add('col-sm-6');
        }
        videoDiv.classList.add('video');

        const currentMedia = this.parentElement.parentElement;
        currentMedia.insertAdjacentElement("afterend", mediaDiv);

        mediaDiv.appendChild(videoDiv);
        const video = document.createElement('video');
        video.classList.add('video-js', 'vjs-16-9');
        video.controls = true;
        video.poster=data.bi;
    
        const src = document.createElement('source');
        src.setAttribute('src', data.urL);
        video.appendChild(src);
        videoDiv.appendChild(video);
        var player = videojs(video);
        // var player = videojs(duplicateVid);
        allowPToPause(video);
        console.log("found videos");
    }
}

function cleanOnLoad()
{
    mainFunction();
    videoCleanseReplace();
    showMessage();
    addProperID();
    addTransitionToID();
    copySourceFromAlbum();
}
window.addEventListener('load', cleanOnLoad);
