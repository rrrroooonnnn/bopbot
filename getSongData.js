import https from 'https';
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
  
  const getYouTubeLink = (query) => {
    const uriString = query;
    const encodedURI = encodeURI(uriString.replace(/\&/g, '-'));
    const options = {
      host: 'youtube.googleapis.com',
      path: `/youtube/v3/search?part=snippet&q=${encodedURI}&key=${process.env.GOOGLE_API}`,
      method: 'GET'
    }
  
    try {
      const getVideoURL = new Promise((resolve, reject) => {
        const req = https.request(options, res => {
          if (res.statusCode === 200) {
            let bufferData = '';
            res.on('data', (data) => {
              bufferData += data;
            }).on('end', () => {
              const responseData = JSON.parse(bufferData);
              if (responseData) {
                const videoList = responseData['items'];
                const lyricsVideo = videoList.filter((video) => {
                  const queryTerms = query.toLowerCase().split(' ').join('');
  
                  const videoTerms = video['snippet'].title.replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, " ").split(' ').filter(el => { const e = el.toLowerCase(); if (e !== 'quot' && e !== 'official' && e !== 'video') return e; }).join('').toLowerCase();
  
                  return videoTerms.includes(queryTerms) || videoTerms === queryTerms;
                })
                const videoID = lyricsVideo.length ? lyricsVideo[0]['id']['videoId'] : null;
                if (videoID) {
                  resolve(`https://www.youtube.com/watch?v=${videoID}`)
                }
                else {
                  resolve('Sorry. Try Again.');
                }
              }
            });
          }
          else {
            console.log('YOUTUBE_API: ' + res.statusCode + '-S' + res.statusMessage);
            return 'Request Failed';
          }
  
        });
  
        req.on('error', (error) => {
          reject(error)
        });
        req.end();
      });
  
      return getVideoURL;
    }
    catch (error) {
      console.log('YOUTUBE_API:' + error)
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
  
  
  export default async (lyrics) => {
    if (lyrics) {
      try {
        // TODO PASS SONG LIST TO SHUFFLE;
        const songList = await getSongList(lyrics);
        if (songList.length) {
          const song = new Song(songList[0]['result'])
          const youtubeQueryString = `${song.artist} ${song.title}`;
          song.videoURL = await getYouTubeLink(youtubeQueryString);
  
          return song;
        }
      }
      catch (err) {
        console.log('LYRIC_API: ' + err)
      }
    }
  }
  