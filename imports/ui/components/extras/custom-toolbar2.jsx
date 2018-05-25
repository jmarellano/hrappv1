import React, { Component, PropTypes } from 'react';
const CustomToolbar = () => (
    <div className="reactQuillToolbar1">
        <select className="ql-header">
            <option value="1" />
            <option value="2" />
            <option value="3" />
            <option value="4" />
        </select>
        <select className="ql-font">
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
            <option value="Arial">Arial</option>
            <option value="Andale Mono">Andale Mono</option>
            <option value="Arial Italic">Arial Italic</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Courier New Bold">Courier New Bold</option>
            <option value="Georgia">Georgia</option>
            <option value="Georgia Bold Italic">Georgia Bold Italic</option>
            <option value="Lucida Sans Unicode">Lucida Sans Unicode</option>
            <option value="Symbol">Symbol</option>
            <option value="Times New Roman Italic">Times New Roman Italic</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Trebuchet MS Bold Italic">Trebuchet MS Bold Italic</option>
            <option value="Verdana">Verdana</option>
            <option value="Verdana Italic">Verdana Italic</option>
            <option value="Arial">Arial</option>
            <option value="Arial">Arial</option>
            <option value="Arial">Arial</option>
            <option value="Arial">Arial</option>
            <option value="Arial">Arial</option>
            <option value="Arial">Arial</option>
            <option value="Arial">Arial</option>
            <option value="Arial">Arial</option>
            <option value="Arial">Arial</option>
            <option value="Arial">Arial</option>
        </select>
        <span />
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
        <button className="ql-blockquote" />
        <button className="ql-code-block" />
        <button value="-1" className="ql-indent" />
        <button value="+1" className="ql-indent" />
        <button value="ordered" className="ql-list" />
        <button value="bullet" className="ql-list" />

        <button value="rtl" className="ql-direction" />

        <button className="ql-link" />
        <button className="ql-image" />
        <button className="ql-video" />

        <select className="ql-color">
        </select>
        <select className="ql-background">
        </select>
        <select className="ql-align">
        </select>

    </div>
);

export default CustomToolbar;