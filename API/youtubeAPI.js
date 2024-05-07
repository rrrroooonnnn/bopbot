import https from 'https';


export default async (query) => {
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

                                const videoTerms = video['snippet'].title.replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, " ").split(' ').filter(el => { const e = el.toLowerCase(); if (e !== 'quot' && e !== 'official' && e !== 'video') return e;}).join('').toLowerCase();
                             
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



