import { EmbedBuilder } from 'discord.js';
import https from 'https';
import youtubeApi from './youtubeAPI.js';
import process from 'process';

class Song {
    constructor(song) {
        this.id = song['id']
        this.artist = song['artist_names']
        this.title = song['title']
        this.lyricsURL = song['lyrics']
        this.videoURL = song['video'];
        this.albumArt = song['song_art_image_url']
        this.thumbnail = song['song_art_image_thumbnail_url']
    }
}

export default async (lyrics) => {
    if (lyrics) {
        try {
            // TODO PASS SONG LIST TO SHUFFLE;
            const songList = await getSongList(lyrics);
            if (songList.length) {
                const song = new Song(songList[0]['result'])
                const songEmbed = createSongEmbed(song);
                const youtubeQueryString = `${song.artist} ${song.title}`;
                song.videoURL = await youtubeApi(youtubeQueryString);

                return song;
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
        const apiToken = process.env['LYRIC_ACCESS_TOKEN'];
        const options = {
            hostname: 'api.genius.com',
            path: `/search?q=${encodedLyrics}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiToken}`
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

const createSongEmbed = (song) => {
    const songEmbed = new EmbedBuilder();
    const id = song.id.toString()
    songEmbed.setAuthor({ name: song.artist, iconURL: song.thumbnail, url: song.lyricsURL })
        .setDescription(id)
        .setTitle(song.title)
        .setImage(song.albumArt);
    return songEmbed;
}



