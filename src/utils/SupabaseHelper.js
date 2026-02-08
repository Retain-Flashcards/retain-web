/**
 * Executes a Supabase query and handles the error unwrapping.
 * 
 * @param {Promise<{ data: any, error: any }>} queryPromise - The Supabase query promise (e.g. supabase.from('...').select())
 * @param {string} [errorMessage] - Optional custom error message to throw if the query fails.
 * @returns {Promise<any>} - Returns the 'data' property of the response on success.
 * @throws {Error} - Throws an error with the Supabase message (or custom message) if the query fails.
 */
export async function runQuery(queryPromise, errorMessage) {
    const { data, error } = await queryPromise
    
    if (error) {
        console.error('Supabase Query Error:', error)
        throw new Error(errorMessage || error.message || 'An unexpected database error occurred.')
    }

    return data
}

/**
 * Executes a Supabase query that is expected to return a single row.
 * Handles the unwrapping and checks if data is returned.
 * 
 * @param {Promise<{ data: any, error: any }>} queryPromise 
 * @param {string} [errorMessage] 
 * @returns {Promise<any>} - Returns the single object.
 */
export async function runQuerySingle(queryPromise, errorMessage) {
    const data = await runQuery(queryPromise, errorMessage)
    
    if (Array.isArray(data)) {
        if (data.length === 0) return null
        return data[0]
    }
    
    return data
}
