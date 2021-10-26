import React from "react";
import Layout from "@theme/Layout";

import styles from './index.module.scss';
import clsx from 'clsx';

function Community() {
    return (
        <Layout title="Community">
            <div className={clsx('subtron', styles.subtron)}>
                <h1>Electron Community</h1>
                <p>Resources for connecting with people working on Electron.</p>
            </div>
        </Layout>
    )
}

export default Community;