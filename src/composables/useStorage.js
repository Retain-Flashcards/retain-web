import useSupabase from './UseSupabase'

export default function useStorage() {

    const uploadPNGFromDataURL = async (dataUrl) => {
        const base64 = dataUrl.replace(/^data:image\/?[A-z]*;base64,/,'')
        const buffer = decode(base64)
        const fileName = generate_uuid() + '.png'
        const filePath = `${supabase.auth.user().id}/card_images/${fileName}`

        return await uploadAndGetPublicUrl('card-images', filePath, buffer, {
            contentType: 'image/png'
        })
    }

    const uploadAndGetPublicUrl = async (bucket, path, toUpload, options) => {
        let publicUrl = undefined
        const uploadInitial = await supabase.storage.from(bucket).upload(path, toUpload, options)
        if (uploadInitial.error) throw new Error('Could not upload file')
        const { data, error } = supabase.storage.from(bucket).getPublicUrl(path)
        if (error) throw new Error('Could not get file URL')
        publicUrl = data.publicURL
        return publicURL
    }

    const uploadImage = async (file) => {

        if (file) {
            //First, upload the file and get the link
            const extension = file.name.split('.').pop().toLowerCase()
            if (!(['jpeg', 'jpg', 'png'].includes(extension))) throw new Error('File must be PNG or JPG')
            const fileName = generate_uuid() + '.' + extension
            const filePath = `${supabase.auth.user().id}/card_images/${fileName}`

            return await uploadAndGetPublicUrl('card-images', filePath, file)
        }

    }

    const uploadPDF = async (file) => {
        if (file) {
            const extension = file.name.split('.').pop().toLowerCase()
            if (extension != 'pdf') throw new Error('File must be a PDF')
            const fileName = generate_uuid() + '.pdf'
            const filePath = `${supabase.auth.user().id}/note-pdfs/${fileName}`

            return await uploadAndGetPublicUrl('note-pdfs', filePath, file)
        }
    }

    return {
        uploadPNGFromDataURL,
        uploadAndGetPublicUrl,
        uploadImage,
        uploadPDF
    }

}