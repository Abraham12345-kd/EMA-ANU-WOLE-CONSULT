// =================================
// SUPABASE CONNECTION
// =================================

const SUPABASE_URL =
    "https://wuhqqdlrydmbtrrzpkob.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_VLL0ZXbSAkmUv7PLQX6oDA_nTVaLAGj";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =================================
// WEBSITE START
// =================================

document.addEventListener("DOMContentLoaded", () => {

    // =================================
    // MOBILE NAVIGATION
    // =================================

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navLinks =
        document.querySelector(".nav-links");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            navLinks.classList.toggle("active");

        });

        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("active");

            });

        });

    }


    // =================================
    // NAVBAR SHADOW
    // =================================

    const header =
        document.querySelector("header");

    if (header) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 50) {

                header.style.boxShadow =
                    "0 4px 20px rgba(0, 0, 0, 0.25)";

            } else {

                header.style.boxShadow =
                    "none";

            }

        });

    }


    // =================================
    // SECTION REVEAL
    // =================================

    const sections =
        document.querySelectorAll("section");

    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "visible"
                            );

                        }

                    });

                },
                {
                    threshold: 0.15
                }
            );

        sections.forEach(section => {

            observer.observe(section);

        });

    }


    // =================================
    // LIGHTBOX
    // =================================

    setupPropertyLightbox();


    // =================================
    // LOAD WEBSITE DATA
    // =================================

    loadProperties();
    loadPropertyOptions();
    loadPropertyVideos();
    loadPropertyGallery();


    // =================================
    // PROPERTY INQUIRY FORM
    // =================================

    const inquiryForm =
        document.querySelector("#inquiry-form");

    if (inquiryForm) {

        inquiryForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const name =
                    document
                        .querySelector("#name")
                        .value
                        .trim();

                const phone =
                    document
                        .querySelector("#phone")
                        .value
                        .trim();

                const property =
                    document
                        .querySelector("#property")
                        .value;

                const message =
                    document
                        .querySelector("#message")
                        .value
                        .trim();


                // Client WhatsApp number

                const whatsappNumber =
                    "2348035837597";


                const whatsappMessage =
                    `Hello EMA & ANU-WOLE CONSULT,

My name is ${name}.

I am interested in:
${property}

My phone number is:
${phone}

Message:
${message ||
"I would like to get more information about this property."
}

Please provide me with more details. Thank you.`;


                const whatsappURL =
                    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        whatsappMessage
                    )}`;


                window.open(
                    whatsappURL,
                    "_blank"
                );

            }
        );

    }

});


// =================================
// PROPERTY LIGHTBOX
// =================================

let lightboxItems = [];

let currentLightboxIndex = 0;

let lightboxTouchStartX = 0;

let lightboxTouchEndX = 0;


// =================================
// SETUP LIGHTBOX
// =================================

function setupPropertyLightbox() {

    let lightbox =
        document.querySelector(
            "#image-lightbox"
        );


    // Create lightbox if it does not exist

    if (!lightbox) {

        lightbox =
            document.createElement("div");

        lightbox.id =
            "image-lightbox";

        lightbox.className =
            "image-lightbox";

        document.body.appendChild(lightbox);

    }


    // Build lightbox structure

    lightbox.innerHTML = `

        <div class="property-lightbox-header">

            <span
                id="lightbox-counter"
                class="lightbox-counter"
            >
                1 / 1
            </span>

            <button
                id="lightbox-close"
                class="lightbox-close"
                type="button"
                aria-label="Close viewer"
            >
                &times;
            </button>

        </div>


        <button
            id="lightbox-prev"
            class="lightbox-nav lightbox-prev"
            type="button"
            aria-label="Previous media"
        >
            &#10094;
        </button>


        <div
            id="lightbox-content"
            class="lightbox-content"
        ></div>


        <button
            id="lightbox-next"
            class="lightbox-nav lightbox-next"
            type="button"
            aria-label="Next media"
        >
            &#10095;
        </button>

    `;


    const closeButton =
        document.querySelector(
            "#lightbox-close"
        );

    const previousButton =
        document.querySelector(
            "#lightbox-prev"
        );

    const nextButton =
        document.querySelector(
            "#lightbox-next"
        );


    // =================================
    // CLOSE BUTTON
    // =================================

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePropertyLightbox
        );

    }


    // =================================
    // PREVIOUS
    // =================================

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                showPreviousMedia();

            }
        );

    }


    // =================================
    // NEXT
    // =================================

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                showNextMedia();

            }
        );

    }


    // =================================
    // BACKDROP CLICK
    // =================================

    lightbox.addEventListener(
        "click",
        (event) => {

            if (
                event.target === lightbox
            ) {

                closePropertyLightbox();

            }

        }
    );


    // =================================
    // SWIPE SUPPORT
    // =================================

    lightbox.addEventListener(
        "touchstart",
        (event) => {

            if (
                event.touches.length !== 1
            ) {

                return;

            }

            lightboxTouchStartX =
                event.touches[0].clientX;

        },
        {
            passive: true
        }
    );


    lightbox.addEventListener(
        "touchend",
        (event) => {

            if (
                event.changedTouches.length !== 1
            ) {

                return;

            }

            lightboxTouchEndX =
                event.changedTouches[0].clientX;

            handleLightboxSwipe();

        },
        {
            passive: true
        }
    );


    // =================================
    // KEYBOARD
    // =================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                !lightbox.classList.contains(
                    "active"
                )
            ) {

                return;

            }


            if (
                event.key === "Escape"
            ) {

                closePropertyLightbox();

            }


            if (
                event.key === "ArrowRight"
            ) {

                showNextMedia();

            }


            if (
                event.key === "ArrowLeft"
            ) {

                showPreviousMedia();

            }

        }
    );

}


// =================================
// HANDLE SWIPE
// =================================

function handleLightboxSwipe() {

    const distance =
        lightboxTouchStartX -
        lightboxTouchEndX;


    const minimumSwipe =
        50;


    if (
        Math.abs(distance) <
        minimumSwipe
    ) {

        return;

    }


    if (distance > 0) {

        showNextMedia();

    } else {

        showPreviousMedia();

    }

}


// =================================
// OPEN PROPERTY LIGHTBOX
// =================================

function openPropertyLightbox(
    propertyMedia,
    startingIndex
) {

    lightboxItems =
        propertyMedia;


    currentLightboxIndex =
        startingIndex;


    const lightbox =
        document.querySelector(
            "#image-lightbox"
        );


    if (!lightbox) {

        return;

    }


    lightbox.classList.add(
        "active"
    );


    document.body.classList.add(
        "lightbox-open"
    );


    showCurrentLightboxMedia();

}


// =================================
// SHOW CURRENT MEDIA
// =================================

function showCurrentLightboxMedia() {

    const lightboxContent =
        document.querySelector(
            "#lightbox-content"
        );

    const counter =
        document.querySelector(
            "#lightbox-counter"
        );


    if (
        !lightboxContent ||
        lightboxItems.length === 0
    ) {

        return;

    }


    const item =
        lightboxItems[
            currentLightboxIndex
        ];


    // Update counter

    if (counter) {

        counter.textContent =
            `${currentLightboxIndex + 1} / ${lightboxItems.length}`;

    }


    // Clear previous media

    lightboxContent.innerHTML =
        "";


    // =================================
    // IMAGE
    // =================================

    if (
        item.media_type === "image"
    ) {

        const image =
            document.createElement("img");

        image.src =
            item.media_url;

        image.alt =
            item.propertyName ||
            "Property image";

        image.className =
            "lightbox-main-image";

        lightboxContent.appendChild(
            image
        );

    }


    // =================================
    // VIDEO
    // =================================

    if (
        item.media_type === "video"
    ) {

        const video =
            document.createElement("video");

        video.className =
            "lightbox-main-video";

        video.controls =
            true;

        video.playsInline =
            true;

        video.preload =
            "metadata";

        video.src =
            item.media_url;

        lightboxContent.appendChild(
            video
        );

    }


    updateLightboxNavigation();

}


// =================================
// UPDATE NAVIGATION
// =================================

function updateLightboxNavigation() {

    const previousButton =
        document.querySelector(
            "#lightbox-prev"
        );

    const nextButton =
        document.querySelector(
            "#lightbox-next"
        );


    const hasMultiple =
        lightboxItems.length > 1;


    if (previousButton) {

        previousButton.style.display =
            hasMultiple
                ? "flex"
                : "none";

    }


    if (nextButton) {

        nextButton.style.display =
            hasMultiple
                ? "flex"
                : "none";

    }

}


// =================================
// NEXT MEDIA
// =================================

function showNextMedia() {

    if (
        lightboxItems.length === 0
    ) {

        return;

    }


    currentLightboxIndex++;


    if (
        currentLightboxIndex >=
        lightboxItems.length
    ) {

        currentLightboxIndex =
            0;

    }


    showCurrentLightboxMedia();

}


// =================================
// PREVIOUS MEDIA
// =================================

function showPreviousMedia() {

    if (
        lightboxItems.length === 0
    ) {

        return;

    }


    currentLightboxIndex--;


    if (
        currentLightboxIndex < 0
    ) {

        currentLightboxIndex =
            lightboxItems.length - 1;

    }


    showCurrentLightboxMedia();

}


// =================================
// CLOSE LIGHTBOX
// =================================

function closePropertyLightbox() {

    const lightbox =
        document.querySelector(
            "#image-lightbox"
        );


    if (!lightbox) {

        return;

    }


    lightbox.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "lightbox-open"
    );


    const lightboxContent =
        document.querySelector(
            "#lightbox-content"
        );


    if (lightboxContent) {

        lightboxContent.innerHTML =
            "";

    }


    lightboxItems =
        [];

    currentLightboxIndex =
        0;

}


// =================================
// LOAD PROPERTIES
// =================================

async function loadProperties() {

    const propertyContainer =
        document.querySelector(
            "#property-container"
        );


    if (!propertyContainer) {

        return;

    }


    propertyContainer.innerHTML =
        "<p>Loading properties...</p>";


    // =================================
    // GET AVAILABLE PROPERTIES
    // =================================

    const {
        data: properties,
        error: propertyError
    } =
        await supabaseClient
            .from("properties")
            .select("*")
            .eq("status", "available")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (propertyError) {

        console.error(
            "PROPERTY LOAD ERROR:",
            propertyError
        );


        propertyContainer.innerHTML =
            "<p>Unable to load properties.</p>";

        return;

    }


    if (
        !properties ||
        properties.length === 0
    ) {

        propertyContainer.innerHTML =
            "<p>No properties are currently available.</p>";

        return;

    }


    // =================================
    // GET ALL MEDIA
    // =================================

    const propertyIds =
        properties.map(
            property => property.id
        );


    const {
        data: media,
        error: mediaError
    } =
        await supabaseClient
            .from("property_media")
            .select("*")
            .in(
                "property_id",
                propertyIds
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (mediaError) {

        console.error(
            "PROPERTY MEDIA LOAD ERROR:",
            mediaError
        );

    }


    // =================================
    // GROUP MEDIA
    // =================================

    const mediaByProperty =
        {};


    (media || []).forEach(
        item => {

            if (
                !mediaByProperty[
                    item.property_id
                ]
            ) {

                mediaByProperty[
                    item.property_id
                ] = [];

            }


            mediaByProperty[
                item.property_id
            ].push(item);

        }
    );


    propertyContainer.innerHTML =
        "";


    // =================================
    // CREATE PROPERTY CARDS
    // =================================

    properties.forEach(
        property => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "property-card";


            let propertyMedia =
                mediaByProperty[
                    property.id
                ] || [];


            // =================================
            // LEGACY MEDIA FALLBACK
            // =================================

            if (
                propertyMedia.length === 0
            ) {

                if (
                    property.image_url
                ) {

                    propertyMedia.push({
                        media_type:
                            "image",

                        media_url:
                            property.image_url
                    });

                }


                if (
                    property.video_url
                ) {

                    propertyMedia.push({
                        media_type:
                            "video",

                        media_url:
                            property.video_url
                    });

                }

            }


            // Add property name

            propertyMedia =
                propertyMedia.map(
                    item => ({
                        ...item,
                        propertyName:
                            property.name
                    })
                );


            // =================================
            // COUNT MEDIA
            // =================================

            const imageCount =
                propertyMedia.filter(
                    item =>
                        item.media_type ===
                        "image"
                ).length;


            const videoCount =
                propertyMedia.filter(
                    item =>
                        item.media_type ===
                        "video"
                ).length;


            const totalMedia =
                propertyMedia.length;


            // =================================
            // CARD PREVIEW
            // =================================

            let previewHTML =
                "";


            const previewItems =
                propertyMedia.slice(
                    0,
                    5
                );


            previewItems.forEach(
                (item, index) => {

                    if (
                        item.media_type ===
                        "image"
                    ) {

                        previewHTML += `

                            <div
                                class="
                                    property-media-item
                                    property-media-clickable
                                "
                                data-media-index="${index}"
                            >

                                <img
                                    src="${escapeHTML(
                                        item.media_url
                                    )}"
                                    alt="${escapeHTML(
                                        property.name
                                    )}"
                                    class="
                                        property-media-image
                                    "
                                    loading="lazy"
                                >

                            </div>

                        `;

                    }


                    if (
                        item.media_type ===
                        "video"
                    ) {

                        previewHTML += `

                            <div
                                class="
                                    property-media-item
                                    property-video-preview
                                "
                                data-media-index="${index}"
                            >

                                <video
                                    src="${escapeHTML(
                                        item.media_url
                                    )}"
                                    class="
                                        property-media-video
                                    "
                                    muted
                                    playsinline
                                    preload="metadata"
                                ></video>

                                <button
                                    type="button"
                                    class="
                                        video-preview-button
                                    "
                                    aria-label="Open property video"
                                >
                                    ▶
                                </button>

                            </div>

                        `;

                    }

                }
            );


            // =================================
            // MORE MEDIA OVERLAY
            // =================================

            if (
                totalMedia > 5
            ) {

                previewHTML += `

                    <button
                        type="button"
                        class="
                            property-more-media
                        "
                    >
                        +${totalMedia - 5} more
                    </button>

                `;

            }


            if (
                propertyMedia.length === 0
            ) {

                previewHTML = `

                    <div
                        class="property-no-media"
                    >
                        <p>
                            Property media coming soon.
                        </p>
                    </div>

                `;

            }


            // =================================
            // MEDIA COUNTER
            // =================================

            let counterHTML =
                "";


            if (
                imageCount > 0 ||
                videoCount > 0
            ) {

                const imageText =
                    imageCount === 1
                        ? "Image"
                        : "Images";


                const videoText =
                    videoCount === 1
                        ? "Video"
                        : "Videos";


                counterHTML = `

                    <div
                        class="
                            property-media-count
                        "
                    >

                        ${
                            imageCount > 0
                                ? `📷 ${imageCount} ${imageText}`
                                : ""
                        }

                        ${
                            imageCount > 0 &&
                            videoCount > 0
                                ? " · "
                                : ""
                        }

                        ${
                            videoCount > 0
                                ? `🎥 ${videoCount} ${videoText}`
                                : ""
                        }

                    </div>

                `;

            }


            // =================================
            // PROPERTY CARD
            // =================================

            card.innerHTML = `

                <div
                    class="property-media"
                >

                    ${counterHTML}

                    <div
                        class="
                            property-media-grid
                        "
                    >

                        ${previewHTML}

                    </div>


                    <span
                        class="property-status"
                    >
                        AVAILABLE
                    </span>

                </div>


                <div
                    class="property-content"
                >

                    <p
                        class="property-location"
                    >
                        📍 ${escapeHTML(
                            property.location ||
                            "Lagos, Nigeria"
                        )}
                    </p>


                    <h3>
                        ${escapeHTML(
                            property.name
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            property.description ||
                            "Contact us for complete property details and inspection."
                        )}
                    </p>


                    <div
                        class="property-details"
                    >

                        <span>
                            🏷️ ${escapeHTML(
                                property.price ||
                                "Contact us"
                            )}
                        </span>


                        <span>
                            📐 ${escapeHTML(
                                property.size ||
                                "Contact us"
                            )}
                        </span>

                    </div>


                    <div
                        class="property-bottom"
                    >

                        <strong>
                            Contact Us
                        </strong>


                        <a
                            href="#contact"
                            class="property-button"
                            data-property="${escapeHTML(
                                property.name
                            )}"
                        >
                            Inquire
                        </a>

                    </div>

                </div>

            `;


            // =================================
            // OPEN MEDIA FROM PROPERTY CARD
            // =================================

            card.querySelectorAll(
                "[data-media-index]"
            ).forEach(
                mediaElement => {

                    mediaElement.addEventListener(
                        "click",
                        (event) => {

                            event.preventDefault();
                            event.stopPropagation();


                            const index =
                                Number(
                                    mediaElement
                                        .dataset
                                        .mediaIndex
                                );


                            openPropertyLightbox(
                                propertyMedia,
                                index
                            );

                        }
                    );

                }
            );


            // =================================
            // MORE BUTTON
            // =================================

            const moreButton =
                card.querySelector(
                    ".property-more-media"
                );


            if (moreButton) {

                moreButton.addEventListener(
                    "click",
                    () => {

                        openPropertyLightbox(
                            propertyMedia,
                            0
                        );

                    }
                );

            }


            // =================================
            // INQUIRE BUTTON
            // =================================

            const inquireButton =
                card.querySelector(
                    ".property-button"
                );


            if (inquireButton) {

                inquireButton.addEventListener(
                    "click",
                    () => {

                        const propertySelect =
                            document.querySelector(
                                "#property"
                            );


                        if (
                            propertySelect
                        ) {

                            propertySelect.value =
                                property.name;

                        }

                    }
                );

            }


            propertyContainer.appendChild(
                card
            );

        }
    );

}


// =================================
// LOAD PROPERTY OPTIONS
// =================================

async function loadPropertyOptions() {

    const propertySelect =
        document.querySelector(
            "#property"
        );


    if (!propertySelect) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("properties")
            .select(
                "id, name"
            )
            .eq(
                "status",
                "available"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "PROPERTY OPTIONS ERROR:",
            error
        );


        propertySelect.innerHTML = `
            <option value="">
                Unable to load properties
            </option>
        `;

        return;

    }


    propertySelect.innerHTML = `
        <option value="">
            Select a property
        </option>
    `;


    (data || []).forEach(
        property => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                property.name;


            option.textContent =
                property.name;


            propertySelect.appendChild(
                option
            );

        }
    );

}


// =================================
// LOAD PROPERTY VIDEOS
// =================================

async function loadPropertyVideos() {

    const videoContainer =
        document.querySelector(
            "#video-container"
        );


    if (!videoContainer) {

        return;

    }


    const {
        data: properties,
        error: propertyError
    } =
        await supabaseClient
            .from("properties")
            .select("id, name")
            .eq(
                "status",
                "available"
            );


    if (propertyError) {

        console.error(
            "VIDEO PROPERTY ERROR:",
            propertyError
        );

        return;

    }


    if (
        !properties ||
        properties.length === 0
    ) {

        videoContainer.innerHTML =
            "<p>No property videos available.</p>";

        return;

    }


    const propertyIds =
        properties.map(
            property => property.id
        );


    const {
        data: media,
        error: mediaError
    } =
        await supabaseClient
            .from("property_media")
            .select("*")
            .in(
                "property_id",
                propertyIds
            )
            .eq(
                "media_type",
                "video"
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (mediaError) {

        console.error(
            "PROPERTY VIDEO ERROR:",
            mediaError
        );

        return;

    }


    if (
        !media ||
        media.length === 0
    ) {

        videoContainer.innerHTML =
            "<p>No property videos available.</p>";

        return;

    }


    const propertyMap =
        {};


    properties.forEach(
        property => {

            propertyMap[
                property.id
            ] =
                property.name;

        }
    );


    videoContainer.innerHTML =
        "";


    media.forEach(
        item => {

            const videoCard =
                document.createElement(
                    "div"
                );


            videoCard.className =
                "video-card";


            videoCard.innerHTML = `

                <video
                    controls
                    playsinline
                    preload="metadata"
                >

                    <source
                        src="${escapeHTML(
                            item.media_url
                        )}"
                        type="video/mp4"
                    >

                    Your browser does not support video playback.

                </video>


                <p>
                    ${escapeHTML(
                        propertyMap[
                            item.property_id
                        ] ||
                        "Property Video"
                    )}
                </p>

            `;


            videoContainer.appendChild(
                videoCard
            );

        }
    );

}


// =================================
// LOAD PROPERTY GALLERY
// =================================

async function loadPropertyGallery() {

    const galleryContainer =
        document.querySelector(
            "#gallery-container"
        );


    if (!galleryContainer) {

        return;

    }


    const {
        data: media,
        error
    } =
        await supabaseClient
            .from("property_media")
            .select(
                "*, properties(name)"
            )
            .eq(
                "media_type",
                "image"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "PROPERTY GALLERY ERROR:",
            error
        );

        return;

    }


    if (
        !media ||
        media.length === 0
    ) {

        galleryContainer.innerHTML =
            "<p>No property gallery images available.</p>";

        return;

    }


    galleryContainer.innerHTML =
        "";


    media.forEach(
        item => {

            const galleryItem =
                document.createElement(
                    "div"
                );


            galleryItem.className =
                "gallery-item";


            galleryItem.innerHTML = `

                <img
                    src="${escapeHTML(
                        item.media_url
                    )}"
                    alt="${escapeHTML(
                        item.properties?.name ||
                        "Property image"
                    )}"
                    class="gallery-image"
                    loading="lazy"
                >

            `;


            galleryItem
                .querySelector("img")
                .addEventListener(
                    "click",
                    () => {

                        const galleryMedia =
                            media.map(
                                image => ({
                                    media_type:
                                        "image",

                                    media_url:
                                        image.media_url,

                                    propertyName:
                                        image.properties?.name ||
                                        "Property image"
                                })
                            );


                        const index =
                            media.findIndex(
                                image =>
                                    image.id ===
                                    item.id
                            );


                        openPropertyLightbox(
                            galleryMedia,
                            index
                        );

                    }
                );


            galleryContainer.appendChild(
                galleryItem
            );

        }
    );

}


// =================================
// ESCAPE HTML
// =================================

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