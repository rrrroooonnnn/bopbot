export default class BotState {
    constructor(videos) {

        this.musicVideos = videos || {};
    }

    addMusicVideo({ id, artist, title, videoURL }) {
        if (!this.musicVideos[id]) {
            this.musicVideos[id] = { artist: '', title: '', videoURL: '' };
        }
        this.musicVideos[id].artist = artist
        this.musicVideos[id].title = title
        this.musicVideos[id].videoURL = videoURL
    }

    getVideoURL(id) {
        return this.musicVideos[id] ? this.musicVideos[id].videoURL : null;
    }
}