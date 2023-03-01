import { MessageEmbed } from 'discord.js';
import https from 'https';
import { braces } from '../constants/regex.js';
import youtubeApi from './youtubeAPI.js';

class Song {
    constructor(song) {
        this.id = song['id']
        this.artist = song['artist_names']
        this.title = song['title']
        this.lyricsURL = song['url']
        this.albumArt = song['song_art_image_url']
        this.thumbnail = song['song_art_image_thumbnail_url']
    }
}

export default async (botState, client) => {
    const lyrics = client.content.match(braces) ? client.content.match(braces)[1] : null;
    if (lyrics) {
        try {
            // TODO PASS SONG LIST TO SHUFFLE;
            const songList = await getSongList(lyrics);
            if (songList.length) {
                const songEmbed = createSongEmbed(songList[0]);
                const { author, title, description } = songEmbed;

                if (description === 'PASS') {
                    delete songEmbed.description //unecessary in the embed
                    await client.reply('https://www.youtube.com/watch?v=P-NYbyl6Wus');
                }
                else {
                    let videoURL = botState.getVideoURL(description);
                    if (!videoURL) {
                        const youtubeQueryString = `${author.name} ${title}`;
                        try {
                            videoURL = await youtubeApi(youtubeQueryString);
                            botState.addMusicVideo({ id: description, artist: author.name, title, videoURL })
                        }
                        catch (error) {
                            console.log('GET_VIDEO_ERROR: ' + error);
                        }

                    }
                    await client.reply(videoURL);
                }
            }
        }
        catch (err) {
            console.log('LYRIC_API: ' + err)
        }
    }
}

const getSongList = (lyrics) => {
    try {
        const encodedLyrics = encodeURI(lyrics);
        const options = {
            hostname: 'api.genius.com',
            path: `/search?q=${encodedLyrics}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env['LYRIC_ACCESS_TOKEN']}`
            }
        }
        return new Promise((resolve, reject) => {
            const req = https.request(options, async res => {
                let bufferData = ''
                if (res.statusCode === 200) {
                    res.on('data', d => {
                        bufferData += d
                    }).on('end', async () => {
                        const responseData = JSON.parse(bufferData);
                        resolve(responseData['response']['hits']);
                    })
                }
                else {
                    console.log('LYRIC_SONG_REQ: ' + res.statusCode + '-' + res.statusMessage)
                }
            });
            req.on('error', error => {
                reject(error)
            })
            req.end()
        });
    }
    catch (error) {
        console.log(error)
    }
}

const createSongEmbed = (songData) => {
    const song = new Song(songData['result']);
    const songEmbed = new MessageEmbed();
    const id = song.id.toString()
    songEmbed.setAuthor(song.artist, song.thumbnail, song.lyricsURL)
        .setDescription(id)
        .setTitle(song.title)
        .setImage(song.albumArt);
    return songEmbed;
}



