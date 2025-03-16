import { useEffect } from 'react'
import { Spinner } from 'reactstrap'
import './LoadingOverlay.css'

function LoadingOverlay() {
    useEffect(() => {
        const handleKeyDown = (event) => {
            event.preventDefault();
        };

        // Attach the event listener to the document
        document.addEventListener('keydown', handleKeyDown);

        // Clean up the event listener when the component is unmounted
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className='full-screen-loading' color='primary'><Spinner></Spinner></div>
    )
}

export default LoadingOverlay