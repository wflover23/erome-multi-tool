// ==UserScript==
// @name         Erome Video Cloner
// @namespace    http://tampermonkey.net/
// @version      0.8.67
// @description  clone videos in an erome album, play multiple & side-by-side!
// @author       inert488
// @license      MIT
// @match        https://www.erome.com/a/*
// @match        http://www.erome.com/a/*
// @exclude      http://www.erome.com/a/*/edit
// @exclude      https://www.erome.com/a/*/edit
// @icon         https://www.erome.com/favicon-32x32.png
// @grant        none
// ==/UserScript==
 
function mainFunction() {
    'use strict';
    const userRow = document.querySelector('.username');
    const cleanseBtn = document.createElement('button');
    cleanseBtn.classList.add('btn', 'btn-grey', 'btn-sm', 'sidebyside-btn');
    cleanseBtn.textContent = 'SIDE-BY-SIDE';
    userRow.appendChild(cleanseBtn);
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
    
    cleanseBtn.addEventListener('click', sideBySide);
    replaceAdWithButtons();
 
    // Your code here...
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
        currentMedia.insertAdjacentElement("afterend", mediaDiv)
 
        mediaDiv.appendChild(videoDiv);
        const video = document.createElement('video');
        video.classList.add('video-js', 'vjs-16-9');
        video.controls = true;
        video.poster=data.bi;
    
        const src = document.createElement('source');
        src.setAttribute('src', data.urL);
        video.appendChild(src);
        videoDiv.appendChild(video);
        videojs(video);
        // var player = videojs(duplicateVid);
        
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
}
window.addEventListener('load', cleanOnLoad);