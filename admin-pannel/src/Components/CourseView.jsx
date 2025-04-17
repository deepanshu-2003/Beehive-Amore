import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaBook, FaFolder, FaLock, FaClock, FaUser, FaTag, FaStar, FaFileVideo, FaFilePdf, FaFolderOpen, FaPlus, FaUpload } from 'react-icons/fa';
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import axios from "axios";
import Hls from "hls.js";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Spinner from "react-bootstrap/Spinner";
import Header from "./Header";
import "./CourseView.css";
import { showToast } from "../utils/toastUtils";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const CourseView = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingContent, setLoadingContent] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileStatuses, setFileStatuses] = useState({});
  const [uploading, setUploading] = useState(false);
  const [parent, setParent] = useState(null);
  const [contentDir, setContentDir] = useState([]);
  const [contentFiles, setContentFiles] = useState([]);
  const [pwd, setPwd] = useState([]);
  // State for Create Folder Modal
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderVisibility, setFolderVisibility] = useState("public");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [userType, setUserType] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const videoRef = useRef(null);
  const [pageLoadQueue, setPageLoadQueue] = useState([]);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const pageChangeTimeoutRef = useRef(null);
  const hlsRef = useRef(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);

  // PDF functions
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setFileLoading(false);
  };

  const changePage = (offset) => {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber >= 1 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
    }
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  // Update PDF rendering function
  const renderPdfViewer = () => {
    if (!currentFile) return null;

    return (
      <div className="pdf-container">
        {fileLoading && (
          <div className="loading-overlay">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading PDF...</p>
          </div>
        )}
        <div className="pdf-content">
          <Document
            file={{
              url: `${import.meta.env.VITE_BACKEND_URL}/course/pdf/${currentFile._id}`,
              httpHeaders: {
                'auth_token': localStorage.getItem("auth_token"),
              },
              withCredentials: false
            }}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => {
              console.error("Error loading PDF:", error);
              setFileLoading(false);
            }}
            loading={
              <div className="text-center p-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading PDF...</span>
                </Spinner>
              </div>
            }
            error={
              <div className="text-center p-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading PDF...</span>
                </Spinner>
              </div>
            }
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
              cMapPacked: true,
              standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/',
            }}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(window.innerWidth * 0.7, 800)}
              loading={
                <div className="text-center p-3">
                  <Spinner animation="border" size="sm" />
                </div>
              }
              error={null}
            />
          </Document>
        </div>
        {numPages > 0 && (
          <div className="pdf-controls">
            <Button 
              onClick={previousPage} 
              disabled={pageNumber <= 1}
              variant="outline-primary"
              className="me-2"
            >
              <i className="fas fa-chevron-left"></i> Previous
            </Button>
            <span className="page-info">
              Page {pageNumber} of {numPages}
            </span>
            <Button 
              onClick={nextPage} 
              disabled={pageNumber >= numPages}
              variant="outline-primary"
              className="ms-2"
            >
              Next <i className="fas fa-chevron-right"></i>
            </Button>
          </div>
        )}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "uploading":
        return "text-primary";
      case "processing":
        return "text-warning";
      case "completed":
        return "text-success";
      case "error":
        return "text-danger";
      default:
        return "text-secondary";
    }
  };

  const navigate = useNavigate();

  // Fetch course details and reviews (runs once on component mount)
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoadingCourse(true);
      try {
        const [courseRes, reviewsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/course/get/${id}`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/course/${id}/reviews`),
        ]);
        setCourse(courseRes.data);
        setReviews(reviewsRes.data.reviews);
        setAverageRating(reviewsRes.data.averageRating);
        setTotalReviews(reviewsRes.data.totalReviews);
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Error fetching course details.");
      } finally {
        setLoadingCourse(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  // Fetch course content (updates when parent changes)
  useEffect(() => {
    const fetchContent = async () => {
      setLoadingContent(true);
      try {
        const contentRes = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/course/show-content`,
          {
            course_id: id,
            ...(parent && { parent: parent }),
          },
          {
            headers: {
              auth_token: localStorage.getItem("auth_token") || null,
            },
          }
        );
        setContentDir(contentRes.data.directories);
        setContentFiles(contentRes.data.files);
      } catch (error) {
        console.error("Error fetching content:", error);
        setMessage("Error loading course content.");
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, [id, parent]);

  // Add useEffect for handling video processing status
  useEffect(() => {
    // Update file statuses when processing videos
    const processingFiles = Object.entries(fileStatuses).filter(
      ([_, status]) => status === "processing"
    );
    if (processingFiles.length > 0) {
      const interval = setInterval(async () => {
        try {
          const contentRes = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/course/show-content`,
            {
              course_id: id,
              ...(parent && { parent: parent }),
            }
          );

          // Check if processing files are now available
          const newFiles = contentRes.data.files;
          processingFiles.forEach(([fileName]) => {
            const fileFound = newFiles.find((f) => f.fileName === fileName);
            if (fileFound) {
              setFileStatuses((prev) => ({
                ...prev,
                [fileName]: "completed",
              }));
            }
          });

          // If all files are processed, clear interval
          if (newFiles.length >= processingFiles.length) {
            clearInterval(interval);
            setContentDir(contentRes.data.directories);
            setContentFiles(contentRes.data.files);
          }
        } catch (error) {
          console.error("Error checking processing status:", error);
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [fileStatuses, id, parent]);

  // Render stars for rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <>
        {[...Array(fullStars)].map((_, index) => (
          <i key={index} className="fas fa-star text-warning"></i>
        ))}
        {halfStar && <i className="fas fa-star-half-alt text-warning"></i>}
        {[...Array(emptyStars)].map((_, index) => (
          <i key={index} className="far fa-star text-warning"></i>
        ))}
      </>
    );
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isValid =
        file.type === "video/mp4" || file.type === "application/pdf";
      if (!isValid) {
        setMessage({
          type: "error",
          text: `${file.name} is not a valid file type. Only MP4 and PDF files are allowed.`,
        });
      }
      return isValid;
    });

    // Set initial status for each file
    const initialStatuses = {};
    validFiles.forEach((file) => {
      initialStatuses[file.name] = "pending";
    });
    setFileStatuses(initialStatuses);
    setSelectedFiles(validFiles);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setMessage({ type: "error", text: "Please select files to upload." });
      return;
    }

    setUploading(true);
    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("course_id", id);
    if (parent) formData.append("parent", parent);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/course/upload-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            auth_token: localStorage.getItem("auth_token") || null,
          },

          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            const newProgress = {};
            selectedFiles.forEach((file) => {
              newProgress[file.name] = progress;
            });
            setUploadProgress(newProgress);
          },
        }
      );

      // Update file statuses based on response
      const newFileStatuses = {};
      response.data.files.forEach((file) => {
        newFileStatuses[file.originalName] = file.status;
      });
      setFileStatuses(newFileStatuses);

      // Refresh content after upload
      const contentRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/course/show-content`,
        {
          course_id: id,
          ...(parent && { parent: parent }),
        }
      );
      setContentDir(contentRes.data.directories);
      setContentFiles(contentRes.data.files);

      setMessage({ type: "success", text: "Files uploaded successfully" });
    } catch (error) {
      console.error("Error uploading files:", error);
      setMessage({ type: "error", text: "Failed to upload files" });
      const newFileStatuses = {};
      selectedFiles.forEach((file) => {
        newFileStatuses[file.name] = "error";
      });
      setFileStatuses(newFileStatuses);
    } finally {
      setUploading(false);
      setSelectedFiles([]);
      setUploadProgress({});
      setShowUploadModal(false);
    }
  };

  // Handle Create Folder Click
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setMessage("Please enter a folder name.");
      return;
    }

    setCreatingFolder(true);

    const payload = {
      name: newFolderName,
      visibility: folderVisibility,
      course_id: id,
    };
    if (parent) payload.parent = parent;

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/course/make-dir`,
        payload,
        {
          headers: {
            auth_token: localStorage.getItem("auth_token") || null,
          },
        }
      );

      setLoadingContent(true);

      // Refresh content after upload
      const contentRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/course/show-content`,
        {
          course_id: id,
          ...(parent && { parent: parent }),
        }
      );
      setContentDir(contentRes.data.directories);
      setContentFiles(contentRes.data.files);
    } catch (error) {
      console.error("Error creating folder:", error);
      setMessage("Failed to create folder.");
    } finally {
      setCreatingFolder(false);
      setNewFolderName("");
      setLoadingContent(false);
      setFolderVisibility("public");
      setShowCreateFolderModal(false);
    }
  };

  // Handle "Add File" or "New Folder" button click
  const handleAddContent = (type) => {
    if (type === "New File") {
      setShowUploadModal(true);
    } else {
      console.log(`Add new content: ${type}`);
    }
  };

  // Handle folder navigation
  const handleNavigate = (newParent) => {
    setParent(newParent._id);
    setPwd([...pwd, newParent]);
  };

  const canAccessFile = (file) => {
    return userType === "admin" || file.visibility !== "private";
  };

  const handleBack = () => {
    if (pwd.length > 0) {
      const newPwd = [...pwd];
      newPwd.pop(); // Remove the last directory in path
      setPwd(newPwd);
      setParent(newPwd.length > 0 ? newPwd[newPwd.length - 1]._id : null);
    }
  };

  // Handle File Playing
  const handleFilePlay = async (file) => {
    setFileLoading(true);
    setFileError(null);
    setCurrentFile(file);
    setShowFileModal(true);
  };

  // Handle edit button click
  const handleEdit = () => {
    console.log("Edit course:", course);
  };

  // Update video handling useEffect
  useEffect(() => {
    if (currentFile?.file_type === 'video' && showFileModal) {
      const initializeVideo = async () => {
        try {
          const videoElement = videoRef.current;
          if (!videoElement) {
            console.error("Video element not found");
            return;
          }

          if (Hls.isSupported()) {
            console.log("HLS is supported");
            const token = localStorage.getItem("auth_token") || null;
            const hls = new Hls({
              xhrSetup: function (xhr) {
                xhr.setRequestHeader("auth_token", token);
              },
              enableWorker: true,
              debug: true,
            });
            hlsRef.current = hls;

            const videoUrl = `${import.meta.env.VITE_BACKEND_URL}/course/stream/${currentFile._id}`;
            console.log("Loading video URL:", videoUrl);

            hls.loadSource(videoUrl);
            hls.attachMedia(videoElement);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS Manifest parsed successfully");
              videoElement.play()
                .then(() => {
                  console.log("Video playback started");
                  setFileLoading(false);
                })
                .catch((error) => {
                  console.error("Error playing video:", error);
                  setFileError("Error starting video playback");
                });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error("HLS error event:", event);
              console.error("HLS error data:", data);
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log("Fatal network error encountered, trying to recover");
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log("Fatal media error encountered, trying to recover");
                    hls.recoverMediaError();
                    break;
                  default:
                    console.error("Fatal error, cannot recover");
                    setFileError("An error occurred while playing the video. Please try again.");
                    hls.destroy();
                    break;
                }
              }
            });
          } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
            console.log("Using native HLS playback");
            const token = localStorage.getItem("auth_token");
            videoElement.src = `${import.meta.env.VITE_BACKEND_URL}/course/stream/${currentFile._id}?token=${token}`;
            
            videoElement.addEventListener("loadedmetadata", () => {
              console.log("Video metadata loaded");
              setFileLoading(false);
              videoElement.play().catch((error) => {
                console.error("Error playing video:", error);
                setFileError("Error playing video");
              });
            });
          } else {
            console.error("HLS is not supported");
            setFileError("Your browser does not support HLS video playback.");
            setFileLoading(false);
          }
        } catch (error) {
          console.error("Error initializing video:", error);
          setFileError("Error initializing video player. Please try again.");
          setFileLoading(false);
        }
      };

      initializeVideo();
    }
  }, [currentFile, showFileModal]);

  // Add cleanup effect for video
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Header />
      <div className="course-container">
        {loadingCourse ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : course ? (
          <>
            <div className="course-header">
              <div className="course-image">
                <img
                  src={course.course_img !== "Please enter a course image" ? course.course_img : "https://via.placeholder.com/300"}
                  alt={course.course_name}
                />
              </div>
              <div className="course-info">
                <h1 className="course-title">{course.course_name}</h1>
                <p className="course-desc">{course.course_desc}</p>
                <div className="meta-items">
                  <div className="meta-item">
                    <i className="far fa-clock"></i>
                    <span>{course.course_duration}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-user"></i>
                    <span>{course.course_instructor}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-star text-warning"></i>
                    <span>{averageRating.toFixed(1)} ({totalReviews} reviews)</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-tag"></i>
                    <span>₹{course.course_price - course.course_discount}</span>
                    {course.course_discount > 0 && (
                      <small className="text-decoration-line-through text-muted ms-2">
                        ₹{course.course_price}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="course-content">
              <div className="add-content mb-4">
                <button
                  className="btn btn-primary me-2"
                  onClick={() => setShowUploadModal(true)}
                >
                  <i className="fas fa-upload me-2"></i>Upload Files
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowCreateFolderModal(true)}
                >
                  <i className="fas fa-folder-plus me-2"></i>Create Folder
                </button>
              </div>

              <div className="content-navigation">
                {pwd.length > 0 && (
                  <button className="btn mx-0" onClick={handleBack}>
                    <i className="fas fa-arrow-left me-2"></i>Back
                  </button>
                )}
                <div className="breadcrumb mb-3">
                  <span
                    className="breadcrumb-item"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setParent(null);
                      setPwd([]);
                    }}
                  >
                    Root
                  </span>
                  {pwd.map((directory, index) => (
                    <React.Fragment key={directory._id}>
                      <span className="breadcrumb-separator">/</span>
                      <span
                        className="breadcrumb-item"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          const newPwd = pwd.slice(0, index + 1);
                          setPwd(newPwd);
                          setParent(directory._id);
                        }}
                      >
                        {directory.fileName}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {loadingContent ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <div className="main-content">
                  {contentDir.map((directory) => (
                    <div
                      key={directory._id}
                      className="folder-card"
                      onClick={() => handleNavigate(directory)}
                    >
                      <div className="d-flex align-items-center">
                        <i className="fas fa-folder fa-2x text-primary me-2"></i>
                        <span>{directory.fileName}</span>
                      </div>
                      {directory.visibility === "private" && (
                        <i className="fas fa-lock text-danger"></i>
                      )}
                    </div>
                  ))}
                  {contentFiles.map((file) => (
                    <div
                      key={file._id}
                      className="file-card"
                      onClick={() => handleFilePlay(file)}
                    >
                      <div className="d-flex align-items-center">
                        {file.file_type === "video" ? (
                          <i className="fas fa-file-video fa-2x text-success me-2"></i>
                        ) : (
                          <i className="fas fa-file-pdf fa-2x text-danger me-2"></i>
                        )}
                        <span>{file.fileName}</span>
                      </div>
                      {file.visibility === "private" && (
                        <i className="fas fa-lock text-danger"></i>
                      )}
                    </div>
                  ))}
                  {contentDir.length === 0 && contentFiles.length === 0 && (
                    <div className="text-center py-4 text-muted">
                      <i className="fas fa-folder-open fa-3x mb-3"></i>
                      <p>This folder is empty</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="course-content mt-4">
              <h3 className="mb-4">
                <i className="fas fa-star text-warning me-2"></i>
                Course Reviews
              </h3>
              <div className="reviews-section">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="review">
                      <strong>
                        <i className="fas fa-user-circle"></i>
                        {review.user_name}
                      </strong>
                      <div className="d-flex align-items-center mt-1">
                        {renderStars(review.rating)}
                        <small className="text-muted ms-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="mt-2">{review.review}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-comments fa-3x mb-3"></i>
                    <p>No reviews yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Upload Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Files</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleFileChange}
              accept="video/*,application/pdf"
            />
          </Form.Group>
          {Object.keys(uploadProgress).length > 0 && (
            <div className="upload-progress">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="progress-item">
                  <span>{fileName}</span>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span>{progress}%</span>
                </div>
              ))}
            </div>
          )}
          {Object.keys(fileStatuses).length > 0 && (
            <div className="mt-3">
              {Object.entries(fileStatuses).map(([fileName, status]) => (
                <div key={fileName} className={`text-${getStatusColor(status)}`}>
                  {fileName}: {status}
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Folder Modal */}
      <Modal show={showCreateFolderModal} onHide={() => setShowCreateFolderModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Folder Name</Form.Label>
            <Form.Control
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Visibility</Form.Label>
            <Form.Select
              value={folderVisibility}
              onChange={(e) => setFolderVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateFolderModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim() || creatingFolder}
          >
            {creatingFolder ? "Creating..." : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* File Viewer Modal */}
      <Modal
        show={showFileModal}
        onHide={() => {
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
          setShowFileModal(false);
          setCurrentFile(null);
          setFileLoading(false);
          setFileError(null);
          setNumPages(null);
          setPageNumber(1);
        }}
        size="lg"
        centered
        className="file-viewer-modal"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>{currentFile?.fileName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentFile?.file_type === 'pdf' && renderPdfViewer()}
          {currentFile?.file_type === 'video' && (
            <div className="video-container">
              {fileLoading && (
                <div className="loading-overlay">
                  <Spinner animation="border" variant="light" />
                  <p className="mt-2 text-light">Loading video...</p>
                </div>
              )}
              <video
                ref={videoRef}
                controls
                playsInline
                onLoadStart={() => setFileLoading(true)}
                onError={(e) => {
                  console.error("Video error:", e.target.error);
                  setFileError("Error playing video. Please try again.");
                  setFileLoading(false);
                }}
              />
              {fileError && (
                <div className="alert alert-danger">
                  {fileError}
                  <Button 
                    variant="outline-light" 
                    size="sm" 
                    className="ms-3"
                    onClick={() => {
                      setFileError(null);
                      setFileLoading(true);
                      handleFilePlay(currentFile);
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CourseView;
