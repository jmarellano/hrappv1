import React from 'react';

export default NotFound = (props) => {
    function redirect() {
        props.history.replace('/');
    }
    switch (props.type) {
        case 'FormsNotFound':
            return (
                <div className='text-center'>
                    <h1>Oops!</h1>
                    <h2>Form Not Found</h2>
                    <h6>The form you are looking for might have been removed or unavailable.</h6>
                    <button className='btn btn-primary' onClick={redirect}>
                        <i className='fa fa-home' aria-hidden='true' /> Take Me Home
                    </button>
                </div>
            );
        default:
            return (
                <div className='text-center'>
                    <h1>Oops!</h1>
                    <h2>404 Not Found</h2>
                    <h6>The page you are looking for might have been removed, had its name changed,<br />or unavailable.</h6>
                    <button className='btn btn-primary' onClick={redirect}>
                        <i className='fa fa-home' aria-hidden='true' /> Take Me Home
                    </button>
                </div>
            );
    }
}