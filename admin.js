// ==========================================
// SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL =
    "https://wuhqqdlrydmbtrrzpkob.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_VLL0ZXbSAkmUv7PLQX6oDA_nTVaLAGj";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ==========================================
// ADMIN LOGIN CHECK
// ==========================================

async function checkAdminLogin() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        console.error(
            "SESSION ERROR:",
            error
        );
    }

    console.log(
        "CURRENT SESSION:",
        session
    );

    if (!session) {

        alert(
            "You are not logged in."
        );

        window.location.href =
            "admin-login.html";

        return false;
    }

    return true;
}


// ==========================================
// RUN LOGIN CHECK
// ==========================================

checkAdminLogin();


// ==========================================
// ELEMENTS
// ==========================================

const propertyForm =
    document.querySelector(
        "#property-form"
    );

const adminPropertyList =
    document.querySelector(
        "#admin-property-list"
    );

const submitButton =
    propertyForm?.querySelector(
        "button[type='submit']"
    );

const logoutButton =
    document.querySelector(
        "#logout-button"
    );


// ==========================================
// EDITING STATE
// ==========================================

let editingId = null;


// ==========================================
// HELPER:
// GET STORAGE PATH FROM PUBLIC URL
// ==========================================

function getStoragePathFromPublicUrl(url) {

    if (!url) {
        return null;
    }

    const marker =
        "/storage/v1/object/public/property-media/";

    const index =
        url.indexOf(marker);

    if (index === -1) {
        return null;
    }

    const path =
        url.substring(
            index + marker.length
        );

    try {

        return decodeURIComponent(
            path
        );

    } catch (error) {

        return path;
    }
}


// ==========================================
// HELPER:
// CREATE SAFE FILE NAME
// ==========================================

function createSafeFileName(fileName) {

    return fileName.replace(
        /[^a-zA-Z0-9._-]/g,
        "-"
    );
}


// ==========================================
// HELPER:
// UPLOAD MEDIA FILES
// ==========================================

async function uploadMediaFiles(
    propertyId,
    imageFiles,
    videoFiles
) {

    const mediaRows = [];

    const uploadedPaths = [];


    // ======================================
    // UPLOAD IMAGES
    // ======================================

    for (
        let i = 0;
        i < imageFiles.length;
        i++
    ) {

        const file =
            imageFiles[i];

        const safeFileName =
            createSafeFileName(
                file.name
            );

        const filePath =
            `images/${propertyId}-${Date.now()}-${i}-${safeFileName}`;

        console.log(
            "Uploading image:",
            filePath
        );


        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("property-media")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false
                    }
                );


        if (uploadError) {

            console.error(
                "IMAGE UPLOAD ERROR:",
                uploadError
            );

            throw uploadError;
        }


        uploadedPaths.push(
            filePath
        );


        const {
            data: publicUrlData
        } =
            supabaseClient
                .storage
                .from("property-media")
                .getPublicUrl(
                    filePath
                );


        mediaRows.push({

            property_id:
                propertyId,

            media_url:
                publicUrlData.publicUrl,

            media_type:
                "image"

        });
    }


    // ======================================
    // UPLOAD VIDEOS
    // ======================================

    for (
        let i = 0;
        i < videoFiles.length;
        i++
    ) {

        const file =
            videoFiles[i];

        const safeFileName =
            createSafeFileName(
                file.name
            );

        const filePath =
            `videos/${propertyId}-${Date.now()}-${i}-${safeFileName}`;


        console.log(
            "Uploading video:",
            filePath
        );


        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("property-media")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false
                    }
                );


        if (uploadError) {

            console.error(
                "VIDEO UPLOAD ERROR:",
                uploadError
            );

            throw uploadError;
        }


        uploadedPaths.push(
            filePath
        );


        const {
            data: publicUrlData
        } =
            supabaseClient
                .storage
                .from("property-media")
                .getPublicUrl(
                    filePath
                );


        mediaRows.push({

            property_id:
                propertyId,

            media_url:
                publicUrlData.publicUrl,

            media_type:
                "video"

        });
    }


    // ======================================
    // SAVE MEDIA INFORMATION
    // ======================================

    if (mediaRows.length > 0) {

        const {
            error: mediaInsertError
        } =
            await supabaseClient
                .from("property_media")
                .insert(
                    mediaRows
                );


        if (mediaInsertError) {

            console.error(
                "MEDIA DATABASE ERROR:",
                mediaInsertError
            );


            // Remove uploaded files
            // if database insert fails.

            if (
                uploadedPaths.length > 0
            ) {

                await supabaseClient
                    .storage
                    .from("property-media")
                    .remove(
                        uploadedPaths
                    );
            }


            throw mediaInsertError;
        }
    }


    return mediaRows;
}


// ==========================================
// FORM SUBMIT
// ==========================================

if (propertyForm) {

    propertyForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const loggedIn =
                await checkAdminLogin();


            if (!loggedIn) {
                return;
            }


            // ==================================
            // BUTTON LOADING STATE
            // ==================================

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    editingId
                        ? "Updating..."
                        : "Adding Property...";
            }


            // ==================================
            // GET FORM VALUES
            // ==================================

            const name =
                document
                    .querySelector(
                        "#property-name"
                    )
                    .value
                    .trim();


            const location =
                document
                    .querySelector(
                        "#property-location"
                    )
                    .value
                    .trim();


            const price =
                document
                    .querySelector(
                        "#property-price"
                    )
                    .value
                    .trim();


            const size =
                document
                    .querySelector(
                        "#property-size"
                    )
                    .value
                    .trim();


            const description =
                document
                    .querySelector(
                        "#property-description"
                    )
                    .value
                    .trim();


            // ==================================
            // GET MULTIPLE FILES
            // ==================================

            const imageInput =
                document.querySelector(
                    "#property-image"
                );

            const videoInput =
                document.querySelector(
                    "#property-video"
                );


            const imageFiles =
                imageInput
                    ? Array.from(
                        imageInput.files
                    )
                    : [];


            const videoFiles =
                videoInput
                    ? Array.from(
                        videoInput.files
                    )
                    : [];


            console.log(
                "Selected images:",
                imageFiles
            );

            console.log(
                "Selected videos:",
                videoFiles
            );


            // ==================================
            // BASIC VALIDATION
            // ==================================

            if (!name) {

                alert(
                    "Please enter the property name."
                );

                return;
            }


            if (!location) {

                alert(
                    "Please enter the property location."
                );

                return;
            }


            if (!price) {

                alert(
                    "Please enter the property price."
                );

                return;
            }


            try {

                // ==================================
                // UPDATE EXISTING PROPERTY
                // ==================================

                if (editingId) {

                    console.log(
                        "Updating property:",
                        editingId
                    );


                    const {
                        error: updateError
                    } =
                        await supabaseClient
                            .from("properties")
                            .update({

                                name:
                                    name,

                                location:
                                    location,

                                price:
                                    price,

                                size:
                                    size,

                                description:
                                    description

                            })
                            .eq(
                                "id",
                                editingId
                            );


                    if (updateError) {

                        console.error(
                            "UPDATE ERROR:",
                            updateError
                        );

                        throw updateError;
                    }


                    // ==================================
                    // ADD NEW MEDIA DURING EDIT
                    // ==================================

                    if (
                        imageFiles.length > 0 ||
                        videoFiles.length > 0
                    ) {

                        const newMedia =
                            await uploadMediaFiles(
                                editingId,
                                imageFiles,
                                videoFiles
                            );


                        // ==================================
                        // UPDATE LEGACY URL FIELDS
                        // ==================================

                        const updateLegacyData = {};


                        const firstNewImage =
                            newMedia.find(
                                function (media) {
                                    return (
                                        media.media_type ===
                                        "image"
                                    );
                                }
                            );


                        const firstNewVideo =
                            newMedia.find(
                                function (media) {
                                    return (
                                        media.media_type ===
                                        "video"
                                    );
                                }
                            );


                        if (firstNewImage) {

                            updateLegacyData.image_url =
                                firstNewImage.media_url;
                        }


                        if (firstNewVideo) {

                            updateLegacyData.video_url =
                                firstNewVideo.media_url;
                        }


                        if (
                            Object.keys(
                                updateLegacyData
                            ).length > 0
                        ) {

                            const {
                                error:
                                    legacyUpdateError
                            } =
                                await supabaseClient
                                    .from("properties")
                                    .update(
                                        updateLegacyData
                                    )
                                    .eq(
                                        "id",
                                        editingId
                                    );


                            if (
                                legacyUpdateError
                            ) {

                                console.error(
                                    "LEGACY URL UPDATE ERROR:",
                                    legacyUpdateError
                                );
                            }
                        }
                    }


                    alert(
                        "Property updated successfully!"
                    );


                    propertyForm.reset();

                    editingId =
                        null;


                    if (submitButton) {

                        submitButton.textContent =
                            "Add Property";
                    }


                    await loadAdminProperties();

                    return;
                }


                // ==================================
                // ADD NEW PROPERTY
                // ==================================

                console.log(
                    "Adding new property..."
                );


                // ==================================
                // CREATE PROPERTY FIRST
                // ==================================

                const {
                    data: propertyData,
                    error: propertyError
                } =
                    await supabaseClient
                        .from("properties")
                        .insert({

                            name:
                                name,

                            location:
                                location,

                            price:
                                price,

                            size:
                                size,

                            description:
                                description,

                            image_url:
                                null,

                            video_url:
                                null,

                            status:
                                "available"

                        })
                        .select()
                        .single();


                if (propertyError) {

                    console.error(
                        "PROPERTY INSERT ERROR:",
                        propertyError
                    );

                    throw propertyError;
                }


                const propertyId =
                    propertyData.id;


                console.log(
                    "New property ID:",
                    propertyId
                );


                // ==================================
                // UPLOAD MEDIA
                // ==================================

                let uploadedMedia = [];


                if (
                    imageFiles.length > 0 ||
                    videoFiles.length > 0
                ) {

                    uploadedMedia =
                        await uploadMediaFiles(
                            propertyId,
                            imageFiles,
                            videoFiles
                        );
                }


                // ==================================
                // UPDATE LEGACY URL FIELDS
                // ==================================

                const legacyData = {};


                const firstImage =
                    uploadedMedia.find(
                        function (media) {
                            return (
                                media.media_type ===
                                "image"
                            );
                        }
                    );


                const firstVideo =
                    uploadedMedia.find(
                        function (media) {
                            return (
                                media.media_type ===
                                "video"
                            );
                        }
                    );


                if (firstImage) {

                    legacyData.image_url =
                        firstImage.media_url;
                }


                if (firstVideo) {

                    legacyData.video_url =
                        firstVideo.media_url;
                }


                if (
                    Object.keys(
                        legacyData
                    ).length > 0
                ) {

                    const {
                        error:
                            legacyUpdateError
                    } =
                        await supabaseClient
                            .from("properties")
                            .update(
                                legacyData
                            )
                            .eq(
                                "id",
                                propertyId
                            );


                    if (
                        legacyUpdateError
                    ) {

                        console.error(
                            "LEGACY URL UPDATE ERROR:",
                            legacyUpdateError
                        );

                        // Don't fail the entire
                        // property creation because
                        // property_media is already saved.
                    }
                }


                // ==================================
                // SUCCESS
                // ==================================

                alert(
                    "Property added successfully!"
                );


                propertyForm.reset();


                editingId =
                    null;


                if (submitButton) {

                    submitButton.textContent =
                        "Add Property";
                }


                await loadAdminProperties();


            } catch (error) {

                console.error(
                    "PROPERTY ERROR:",
                    error
                );


                alert(
                    "Something went wrong:\n\n" +
                    (
                        error?.message ||
                        "Unknown error"
                    )
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        editingId
                            ? "Update Property"
                            : "Add Property";
                }
            }
        }
    );
}


// ==========================================
// LOAD ADMIN PROPERTIES
// ==========================================

async function loadAdminProperties() {

    if (!adminPropertyList) {
        return;
    }


    adminPropertyList.innerHTML =
        "<p>Loading properties...</p>";


    try {

        // ======================================
        // GET PROPERTIES
        // ======================================

        const {
            data: properties,
            error: propertyError
        } =
            await supabaseClient
                .from("properties")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (propertyError) {

            console.error(
                "LOAD PROPERTY ERROR:",
                propertyError
            );

            throw propertyError;
        }


        // ======================================
        // GET ALL PROPERTY MEDIA
        // ======================================

        const {
            data: allMedia,
            error: mediaError
        } =
            await supabaseClient
                .from("property_media")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (mediaError) {

            console.error(
                "LOAD MEDIA ERROR:",
                mediaError
            );

            throw mediaError;
        }


        // ======================================
        // NO PROPERTIES
        // ======================================

        if (
            !properties ||
            properties.length === 0
        ) {

            adminPropertyList.innerHTML =
                `
                <div class="admin-empty-state">
                    <h3>No properties yet</h3>
                    <p>Add your first property using the form above.</p>
                </div>
                `;

            return;
        }


        // ======================================
        // CREATE MEDIA MAP
        // ======================================

        const mediaMap = {};


        (allMedia || []).forEach(
            function (media) {

                if (
                    !mediaMap[
                        media.property_id
                    ]
                ) {

                    mediaMap[
                        media.property_id
                    ] = [];
                }


                mediaMap[
                    media.property_id
                ].push(media);
            }
        );


        // ======================================
        // CLEAR LIST
        // ======================================

        adminPropertyList.innerHTML =
            "";


        // ======================================
        // DISPLAY PROPERTIES
        // ======================================

        properties.forEach(
            function (property) {

                // =================================
                // PROPERTY CARD
                // =================================

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "admin-property-card";


                // =================================
                // PROPERTY TITLE
                // =================================

                const title =
                    document.createElement(
                        "h3"
                    );

                title.textContent =
                    property.name ||
                    "Unnamed Property";


                // =================================
                // PROPERTY INFORMATION
                // =================================

                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "admin-property-info";


                const locationText =
                    property.location ||
                    "Not provided";

                const priceText =
                    property.price ||
                    "Not provided";

                const sizeText =
                    property.size ||
                    "Not provided";

                const statusText =
                    property.status ||
                    "available";

                const descriptionText =
                    property.description ||
                    "No description";


                info.innerHTML = `

                    <p>
                        <strong>Location:</strong>
                        ${escapeHTML(
                            locationText
                        )}
                    </p>

                    <p>
                        <strong>Price:</strong>
                        ${escapeHTML(
                            priceText
                        )}
                    </p>

                    <p>
                        <strong>Size:</strong>
                        ${escapeHTML(
                            sizeText
                        )}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${escapeHTML(
                            statusText
                        )}
                    </p>

                    <p>
                        <strong>Description:</strong>
                        ${escapeHTML(
                            descriptionText
                        )}
                    </p>

                `;


                // =================================
                // FIXED MEDIA WINDOW
                // =================================

                const mediaContainer =
                    document.createElement(
                        "div"
                    );

                mediaContainer.className =
                    "admin-property-media";


                // =================================
                // MEDIA TRACK
                // =================================

                const mediaTrack =
                    document.createElement(
                        "div"
                    );

                mediaTrack.className =
                    "admin-property-image-track";


                // =================================
                // GET PROPERTY MEDIA
                // =================================

                const propertyMedia =
                    mediaMap[property.id]
                        ? [
                            ...mediaMap[
                                property.id
                            ]
                        ]
                        : [];


                // =================================
                // LEGACY FALLBACK
                // =================================

                // If property_media has no
                // records, use old fields.

                if (
                    propertyMedia.length === 0
                ) {

                    if (
                        property.image_url
                    ) {

                        propertyMedia.push({

                            media_url:
                                property.image_url,

                            media_type:
                                "image"

                        });
                    }


                    if (
                        property.video_url
                    ) {

                        propertyMedia.push({

                            media_url:
                                property.video_url,

                            media_type:
                                "video"

                        });
                    }
                }


                // =================================
                // MEDIA COUNTER
                // =================================

                const mediaCounter =
                    document.createElement(
                        "div"
                    );

                mediaCounter.className =
                    "admin-media-counter";


                if (
                    propertyMedia.length > 0
                ) {

                    mediaCounter.textContent =
                        `${propertyMedia.length} media`;

                } else {

                    mediaCounter.textContent =
                        "No media";
                }


                mediaContainer.appendChild(
                    mediaCounter
                );


                // =================================
                // DISPLAY MEDIA
                // =================================

                if (
                    propertyMedia.length === 0
                ) {

                    const noMedia =
                        document.createElement(
                            "div"
                        );

                    noMedia.className =
                        "admin-no-media";

                    noMedia.textContent =
                        "No media uploaded.";


                    mediaTrack.appendChild(
                        noMedia
                    );

                } else {

                    propertyMedia.forEach(
                        function (media) {

                            // ==========================
                            // IMAGE
                            // ==========================

                            if (
                                media.media_type ===
                                "image"
                            ) {

                                const image =
                                    document.createElement(
                                        "img"
                                    );


                                image.src =
                                    media.media_url;

                                image.alt =
                                    property.name ||
                                    "Property image";

                                image.loading =
                                    "lazy";

                                image.draggable =
                                    false;


                                mediaTrack.appendChild(
                                    image
                                );
                            }


                            // ==========================
                            // VIDEO
                            // ==========================

                            else if (
                                media.media_type ===
                                "video"
                            ) {

                                const video =
                                    document.createElement(
                                        "video"
                                    );


                                video.src =
                                    media.media_url;

                                video.controls =
                                    true;

                                video.preload =
                                    "metadata";

                                video.playsInline =
                                    true;


                                mediaTrack.appendChild(
                                    video
                                );
                            }

                        }
                    );
                }


                // =================================
                // PUT TRACK INSIDE MEDIA WINDOW
                // =================================

                mediaContainer.appendChild(
                    mediaTrack
                );


                // =================================
                // ACTION BUTTONS
                // =================================

                const actions =
                    document.createElement(
                        "div"
                    );

                actions.className =
                    "admin-property-actions";


                // =================================
                // EDIT BUTTON
                // =================================

                const editButton =
                    document.createElement(
                        "button"
                    );

                editButton.type =
                    "button";

                editButton.textContent =
                    "Edit";

                editButton.className =
                    "edit-button";

                editButton.dataset.id =
                    property.id;


                // =================================
                // SOLD BUTTON
                // =================================

                const soldButton =
                    document.createElement(
                        "button"
                    );

                soldButton.type =
                    "button";

                soldButton.textContent =
                    property.status === "sold"
                        ? "Mark Available"
                        : "Mark as Sold";

                soldButton.className =
                    "sold-button";

                soldButton.dataset.id =
                    property.id;

                soldButton.dataset.status =
                    property.status ||
                    "available";


                // =================================
                // DELETE BUTTON
                // =================================

                const deleteButton =
                    document.createElement(
                        "button"
                    );

                deleteButton.type =
                    "button";

                deleteButton.textContent =
                    "Delete";

                deleteButton.className =
                    "delete-button";

                deleteButton.dataset.id =
                    property.id;


                // =================================
                // ADD BUTTONS
                // =================================

                actions.appendChild(
                    editButton
                );

                actions.appendChild(
                    soldButton
                );

                actions.appendChild(
                    deleteButton
                );


                // =================================
                // BUILD CARD
                // =================================

                card.appendChild(
                    title
                );

                card.appendChild(
                    info
                );

                card.appendChild(
                    mediaContainer
                );

                card.appendChild(
                    actions
                );


                adminPropertyList.appendChild(
                    card
                );
            }
        );

    } catch (error) {

        console.error(
            "LOAD ADMIN PROPERTIES ERROR:",
            error
        );


        adminPropertyList.innerHTML =
            `
            <div class="admin-error-state">
                <h3>Failed to load properties</h3>
                <p>${escapeHTML(
                    error?.message ||
                    "Unknown error"
                )}</p>
            </div>
            `;
    }
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ==========================================
// MARK PROPERTY AS SOLD / AVAILABLE
// ==========================================

if (adminPropertyList) {

    adminPropertyList.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    ".sold-button"
                );


            if (!button) {
                return;
            }


            const propertyId =
                button.dataset.id;

            const currentStatus =
                button.dataset.status;


            const newStatus =
                currentStatus === "sold"
                    ? "available"
                    : "sold";


            const confirmation =
                confirm(
                    newStatus === "sold"
                        ? "Mark this property as SOLD?"
                        : "Mark this property as AVAILABLE?"
                );


            if (!confirmation) {
                return;
            }


            button.disabled =
                true;


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .from("properties")
                        .update({

                            status:
                                newStatus

                        })
                        .eq(
                            "id",
                            propertyId
                        );


                if (error) {
                    throw error;
                }


                await loadAdminProperties();


            } catch (error) {

                console.error(
                    "STATUS UPDATE ERROR:",
                    error
                );


                alert(
                    "Failed to update property status:\n\n" +
                    (
                        error?.message ||
                        "Unknown error"
                    )
                );


                button.disabled =
                    false;
            }
        }
    );
}


// ==========================================
// DELETE PROPERTY
// ==========================================

if (adminPropertyList) {

    adminPropertyList.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    ".delete-button"
                );


            if (!button) {
                return;
            }


            const propertyId =
                button.dataset.id;


            const confirmation =
                confirm(
                    "Are you sure you want to delete this property?\n\n" +
                    "This will remove the property and all of its uploaded media."
                );


            if (!confirmation) {
                return;
            }


            button.disabled =
                true;

            button.textContent =
                "Deleting...";


            try {

                // ==================================
                // GET PROPERTY
                // ==================================

                const {
                    data: property,
                    error: propertyError
                } =
                    await supabaseClient
                        .from("properties")
                        .select(
                            "image_url, video_url"
                        )
                        .eq(
                            "id",
                            propertyId
                        )
                        .single();


                if (propertyError) {
                    throw propertyError;
                }


                // ==================================
                // GET ALL PROPERTY MEDIA
                // ==================================

                const {
                    data: media,
                    error: mediaError
                } =
                    await supabaseClient
                        .from("property_media")
                        .select(
                            "id, media_url, media_type"
                        )
                        .eq(
                            "property_id",
                            propertyId
                        );


                if (mediaError) {
                    throw mediaError;
                }


                // ==================================
                // COLLECT STORAGE PATHS
                // ==================================

                const storagePaths = [];


                function addStoragePath(url) {

                    const path =
                        getStoragePathFromPublicUrl(
                            url
                        );


                    if (
                        path &&
                        !storagePaths.includes(
                            path
                        )
                    ) {

                        storagePaths.push(
                            path
                        );
                    }
                }


                // Legacy fields

                addStoragePath(
                    property.image_url
                );

                addStoragePath(
                    property.video_url
                );


                // property_media

                if (media) {

                    media.forEach(
                        function (item) {

                            addStoragePath(
                                item.media_url
                            );
                        }
                    );
                }


                console.log(
                    "Files to delete:",
                    storagePaths
                );


                // ==================================
                // DELETE MEDIA DATABASE RECORDS
                // ==================================

                const {
                    error:
                        mediaDeleteError
                } =
                    await supabaseClient
                        .from("property_media")
                        .delete()
                        .eq(
                            "property_id",
                            propertyId
                        );


                if (
                    mediaDeleteError
                ) {

                    throw mediaDeleteError;
                }


                // ==================================
                // DELETE PROPERTY
                // ==================================

                const {
                    error: deleteError
                } =
                    await supabaseClient
                        .from("properties")
                        .delete()
                        .eq(
                            "id",
                            propertyId
                        );


                if (deleteError) {
                    throw deleteError;
                }


                // ==================================
                // DELETE STORAGE FILES
                // ==================================

                if (
                    storagePaths.length > 0
                ) {

                    const {
                        error:
                            storageDeleteError
                    } =
                        await supabaseClient
                            .storage
                            .from(
                                "property-media"
                            )
                            .remove(
                                storagePaths
                            );


                    if (
                        storageDeleteError
                    ) {

                        console.error(
                            "STORAGE DELETE ERROR:",
                            storageDeleteError
                        );


                        alert(
                            "Property deleted, but some media files could not be removed from storage."
                        );
                    }
                }


                await loadAdminProperties();


            } catch (error) {

                console.error(
                    "DELETE PROPERTY ERROR:",
                    error
                );


                alert(
                    "Failed to delete property:\n\n" +
                    (
                        error?.message ||
                        "Unknown error"
                    )
                );


                button.disabled =
                    false;

                button.textContent =
                    "Delete";
            }
        }
    );
}


// ==========================================
// EDIT PROPERTY
// ==========================================

if (adminPropertyList) {

    adminPropertyList.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    ".edit-button"
                );


            if (!button) {
                return;
            }


            const propertyId =
                button.dataset.id;


            try {

                const {
                    data: property,
                    error
                } =
                    await supabaseClient
                        .from("properties")
                        .select("*")
                        .eq(
                            "id",
                            propertyId
                        )
                        .single();


                if (error) {
                    throw error;
                }


                // ==================================
                // PUT VALUES INTO FORM
                // ==================================

                document
                    .querySelector(
                        "#property-name"
                    )
                    .value =
                    property.name || "";


                document
                    .querySelector(
                        "#property-location"
                    )
                    .value =
                    property.location || "";


                document
                    .querySelector(
                        "#property-price"
                    )
                    .value =
                    property.price || "";


                document
                    .querySelector(
                        "#property-size"
                    )
                    .value =
                    property.size || "";


                document
                    .querySelector(
                        "#property-description"
                    )
                    .value =
                    property.description || "";


                // ==================================
                // SET EDITING ID
                // ==================================

                editingId =
                    property.id;


                // ==================================
                // CHANGE BUTTON TEXT
                // ==================================

                if (submitButton) {

                    submitButton.textContent =
                        "Update Property";
                }


                // ==================================
                // SCROLL TO FORM
                // ==================================

                if (propertyForm) {

                    propertyForm.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });
                }


            } catch (error) {

                console.error(
                    "EDIT PROPERTY ERROR:",
                    error
                );


                alert(
                    "Failed to load property:\n\n" +
                    (
                        error?.message ||
                        "Unknown error"
                    )
                );
            }
        }
    );
}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            const confirmation =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmation) {
                return;
            }


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .signOut();


                if (error) {
                    throw error;
                }


                window.location.href =
                    "admin-login.html";


            } catch (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );


                alert(
                    "Logout failed:\n\n" +
                    (
                        error?.message ||
                        "Unknown error"
                    )
                );
            }
        }
    );
}


// ==========================================
// LOAD PROPERTIES WHEN ADMIN PAGE OPENS
// ==========================================

loadAdminProperties();