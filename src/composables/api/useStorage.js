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

    const uploadPDF = async (file, name = 'Test') => {
        if (file) {
            const extension = file.name.split('.').pop().toLowerCase()
            if (extension != 'pdf') throw new Error('File must be a PDF')
            const fileName = generate_uuid() + '.pdf'
            const filePath = `${getCurrentUserId()}/note-pdfs/${fileName}`
            return await uploadAndGetPublicUrl('note-pdfs', filePath, file, { metadata: { title: name } })
        }
    }

    const listNotePdfs = async () => {
        const { data, error } = await supabase.storage.from('note-pdfs').list(`${getCurrentUserId()}/note-pdfs`)
        if (error) throw new Error('Could not list note PDFs')

        //Now we need to get the metadata
        const filesWithMetadata = await Promise.all(data.map(async (file) => {
            const { data: metadata, error } = await supabase.storage.from('note-pdfs').info(`${getCurrentUserId()}/note-pdfs/${file.name}`)
            if (error) throw new Error('Could not get file metadata')
            return { ...file, user_metadata: metadata.metadata, filePath: `${getCurrentUserId()}/note-pdfs/${file.name}` }
        }))
        
        return filesWithMetadata
    }

    const getPublicUrl = (filePath) => {
        const { data, error } = supabase.storage.from('note-pdfs').getPublicUrl(filePath)
        if (error) throw new Error('Could not get file URL')
        return data.publicUrl
    }

    const deleteNote = async (filePath) => {
        const { error } = await supabase.storage.from('note-pdfs').remove([filePath])
        if (error) throw new Error('Could not delete file')
    }

    return {
        uploadPNGFromDataURL,
        uploadAndGetPublicUrl,
        uploadImage,
        uploadPDF,
        convertImageToBlob,
        listNotePdfs,
        getPublicUrl,
        deleteNote
    }

}