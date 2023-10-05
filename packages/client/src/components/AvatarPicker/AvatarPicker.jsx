import React, { useState } from "react";
import { Figure, Row, Col, Form } from "react-bootstrap";
import "./AvatarPicker.scss";


const AvatarPicker = ({ avatars, selectedAvatar, onSelect, onUpload }) => {
    const [customImage, setCustomImage] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setCustomImage(file);
        onUpload(file);
    };

    return (

        <div >
            <h3 className="avatar-picker-heading">Choose Avatar</h3>
            <Row className="avatar-picker">
                {avatars.map((avatar, index) => (
                    <Figure
                        key={index}
                        className={`avatar-option col-2 ${avatar === selectedAvatar ? "selected" : ""
                            }`}
                        onClick={() => onSelect(avatar)}
                    >
                        <Figure.Image src={avatar} />
                    </Figure>
                ))}


            </Row>
        </div>
    );
};

export default AvatarPicker;