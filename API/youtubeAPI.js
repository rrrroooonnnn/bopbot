import https from 'https';


export default async (query) => {
    const encodedURI = encodeURI(query.replace(/\&/g, '-'));
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
                            const videoID = responseData['items'][0]['id']['videoId'];
                            resolve(`https://www.youtube.com/watch?v=${videoID}`)
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

