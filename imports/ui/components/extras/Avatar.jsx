import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

export default class Avatar extends React.Component {
    constructor(props) {
        super(props);
    }

   render() {
        let initials = this.props.username[0].toUpperCase() + this.props.username[1].toLowerCase()
        return (
            <span className='badge m-1'
                  title={this.props.username}
                  style={ {
                      backgroundColor: this.props.color,
                      border: '1px solid #c9c9c9'
                  } }
            >{ initials }</span>
        )
    }
}

export function getRandomColor(){
    let colors = [
        '#c9ddff', // A
        '#eec9ff', // B
        '#ffc9c9', // C
        '#f4ffc9', // D
        '#c9ffcd', // E
        '#ffb2b2', // F
        '#ffc107', // G
        '#edc27d', // H
        '#b9c0f9', // I
        '#9df7b5', // J
        '#f9fffe', // K
        '#77ffe8', // L
        '#ecff77', // M
        '#ffc6f7', // N
        '#d8d6d8', // O
        '#dfceff', // P
        '#ccfcea', // Q
        '#74fcc9', // R
        '#defc74', // S
        '#dbedff', // T
        '#78fc74', // U
        '#69efed', // V
        '#ccddff', // W
        '#f2a4e0', // X
        '#f1a3c8', // Y
        '#fcb3b3'  // Z
    ];
    let randomColor = colors[Math.floor(Math.random() * colors.length)];
    return randomColor;
}



