import useSupabase from './UseSupabase'
import { generate_uuid } from '../../utils'

const { supabase, getCurrentUserId } = useSupabase()

export default function useStorage() {

    const uploadPNGFromDataURL = async (dataUrl) => {
        const base64 = dataUrl.replace(/^data:image\/?[A-z]*;base64,/,'')
        const buffer = atob(base64)
        const fileName = generate_uuid() + '.png'
        const filePath = `${getCurrentUserId()}/card_images/${fileName}`

        return await uploadAndGetPublicUrl('card-images', filePath, buffer, {
            contentType: 'image/png'
        })
    }

    const convertImageToBlob = async (dataUrl) => {
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        return blob
    }

    const uploadAndGetPublicUrl = async (bucket, path, toUpload, options) => {
        let publicUrl = undefined
        const uploadInitial = await supabase.storage.from(bucket).upload(path, toUpload, options)
        if (uploadInitial.error) throw new Error('Could not upload file')
        const { data, error } = supabase.storage.from(bucket).getPublicUrl(path)
        if (error) throw new Error('Could not get file URL')
        publicUrl = data.publicUrl
        return publicUrl
    }

    const uploadImage = async (file) => {

        if (file) {
            //First, upload the file and get the link
            const extension = file.name.split('.').pop().toLowerCase()
            if (!(['jpeg', 'jpg', 'png'].includes(extension))) throw new Error('File must be PNG or JPG')
            const fileName = generate_uuid() + '.' + extension
            const filePath = `${getCurrentUserId()}/card_images/${fileName}`

            return await uploadAndGetPublicUrl('card-images', filePath, file)
        }

    }

    const uploadPDF = async (file) => {
        if (file) {
            const extension = file.name.split('.').pop().toLowerCase()
            if (extension != 'pdf') throw new Error('File must be a PDF')
            const fileName = generate_uuid() + '.pdf'
            const filePath = `${getCurrentUserId()}/note-pdfs/${fileName}`
            return await uploadAndGetPublicUrl('note-pdfs', filePath, file)
        }
    }

    return {
        uploadPNGFromDataURL,
        uploadAndGetPublicUrl,
        uploadImage,
        uploadPDF,
        convertImageToBlob
    }

}