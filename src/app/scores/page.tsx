"use client";
import React, { useState, useEffect } from "react";



export default function Scores() {
    const [address, setAddress] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState("");
    const [error, setError] = useState<string | null>(null);

    

    

    return (
        <div>
            <div>
                Scores List
            </div>

            {error && <div>Error: {error}</div>}
        </div>
    );
}
