import { supabase } from "./supabase"

type BucketName = "photos" | "audio" | "videos" | "avatars" | "documents" | "game-assets"

export async function uploadFile(file: File, bucketName: BucketName, fileName: string, metadata?: Record<string, any>) {
  if (!supabase) {
    throw new Error("Supabase not configured")
  }

  try {
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    // If it's a photo, save metadata to database
    if (bucketName === "photos" && metadata) {
      const { data: dbData, error: dbError } = await supabase
        .from("photos")
        .insert({
          url: urlData.publicUrl,
          uploader: metadata.uploader || "Anonymous",
          caption: metadata.caption || "",
        })
        .select()
        .single()

      if (dbError) {
        throw dbError
      }

      return {
        url: urlData.publicUrl,
        data: dbData,
      }
    }

    return {
      url: urlData.publicUrl,
      path: fileName,
    }
  } catch (error) {
    console.error(`Error uploading to ${bucketName}:`, error)
    throw error
  }
}

export async function getPhotos() {
  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase.from("photos").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching photos:", error)
      return []
    }

    console.log("Fetched photos:", data)
    return data || []
  } catch (error) {
    console.error("Error in getPhotos:", error)
    return []
  }
}

export async function getFiles(bucketName: BucketName, folder = "") {
  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase.storage.from(bucketName).list(folder)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error(`Error listing files in ${bucketName}:`, error)
    return []
  }
}

export async function deletePhoto(photoId: string, fileName: string) {
  if (!supabase) {
    throw new Error("Supabase not configured")
  }

  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage.from("photos").remove([fileName])

    if (storageError) {
      console.error("Storage deletion error:", storageError)
      // Continue even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase.from("photos").delete().eq("id", photoId)

    if (dbError) {
      throw dbError
    }

    return true
  } catch (error) {
    console.error("Error deleting photo:", error)
    throw error
  }
}

export async function deleteFile(bucketName: BucketName, filePath: string) {
  if (!supabase) {
    throw new Error("Supabase not configured")
  }

  try {
    const { error } = await supabase.storage.from(bucketName).remove([filePath])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error deleting from ${bucketName}:`, error)
    throw error
  }
}

// Helper for audio files
export async function uploadAudio(file: File, fileName: string) {
  return uploadFile(file, "audio", fileName)
}

// Helper for videos
export async function uploadVideo(file: File, fileName: string) {
  return uploadFile(file, "videos", fileName)
}

// Helper for avatars
export async function uploadAvatar(file: File, userName: string) {
  const fileName = `${userName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.jpg`
  return uploadFile(file, "avatars", fileName)
}

// Helper for photos (with metadata) - Updated to handle RLS properly
export async function uploadPhoto(file: File, fileName: string) {
  if (!supabase) {
    throw new Error("Supabase not configured")
  }

  try {
    console.log("Starting upload for:", fileName)

    // Upload file to storage first
    const { data: uploadData, error: uploadError } = await supabase.storage.from("photos").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw uploadError
    }

    console.log("File uploaded successfully:", uploadData)

    // Get public URL
    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName)
    console.log("Public URL generated:", urlData.publicUrl)

    // Try to save photo metadata to database with better error handling
    try {
      const { data: dbData, error: dbError } = await supabase
        .from("photos")
        .insert({
          url: urlData.publicUrl,
          uploader: "Anonymous",
          caption: "",
          is_approved: true,
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database error details:", dbError)
        // If database insert fails, we still have the file uploaded
        // Return the URL so the upload isn't completely lost
        return {
          url: urlData.publicUrl,
          data: null,
          warning: "File uploaded but metadata not saved to database",
        }
      }

      console.log("Photo metadata saved:", dbData)
      return {
        url: urlData.publicUrl,
        data: dbData,
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError)
      // Return the uploaded file URL even if database fails
      return {
        url: urlData.publicUrl,
        data: null,
        warning: "File uploaded but metadata not saved",
      }
    }
  } catch (error) {
    console.error("Error uploading photo:", error)
    throw error
  }
}
