import { useState } from 'react'
import './App.css'

function App() {
  const [spotifyLink, setSpotifyLink] = useState('')
  const [appleLink, setAppleLink] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    // URL validation
    if (!spotifyLink.includes('spotify.com')) {
      alert('Please enter a valid Spotify Wrapped link')
      return
    }

    if (!appleLink.includes('music.apple.com')) {
      alert('Please enter a valid Apple Music Replay link')
      return
    }

    console.log('Spotify:', spotifyLink)
    console.log('Apple Music:', appleLink)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <h1>Resonate</h1>
        <form className="link-form" onSubmit={handleSubmit}>
          <div className={`input-group spotify ${spotifyLink ? 'filled' : ''}`}>
            <input
              type="url"
              id="spotify"
              value={spotifyLink}
              onChange={(e) => setSpotifyLink(e.target.value)}
              required
            />
            <label htmlFor="spotify">Spotify Wrapped Link</label>
          </div>

          <div className={`input-group apple ${appleLink ? 'filled' : ''}`}>
            <input
              type="url"
              id="apple"
              value={appleLink}
              onChange={(e) => setAppleLink(e.target.value)}
              required
            />
            <label htmlFor="apple">Apple Music Replay Link</label>
          </div>

          <button type="submit">Submit</button>
        </form>

        <div className={`success-message ${submitted ? 'show' : ''}`}>
          Links submitted successfully!
        </div>
      </div>
    </div>
  )
}

export default App
