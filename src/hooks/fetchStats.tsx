
export async function fetchStats(lastEventId: string) {
    const refreshToken = localStorage.getItem('google_refresh_token')
    const url = new URL('/api/stats', window.location.origin)
    url.searchParams.append('eventId', lastEventId)
    if (refreshToken && refreshToken !== 'null') {
        url.searchParams.append('refreshToken', refreshToken)
    }

    // Fetch the stats from the API
    const response = await fetch(url.toString())
    const data = await response.json()

    return data
}