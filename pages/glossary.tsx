import { GetStaticProps } from 'next';
import Head from 'next/head';
import React, { useMemo } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import externalLinks from 'remark-external-links';
import Edit from '../components/edit';
import { allGlossaryEntries, Entry } from '../libs/db/glossary';
import { EntryLinked, linkDefintionToGlossary } from '../libs/pages/glossary';
import { TABLE_CUSTOM_STYLES } from '../libs/utils/DataTableConstants';
import { mightFailWithArray } from '../libs/utils/util';

type Props = {
    es: EntryLinked[];
};

const formatRefs = (e: EntryLinked) => {
    const urls = e.urls.split('\n');
    if (urls === undefined || urls === null) {
        return <></>;
    }

    const refs = urls.map((url, i) => {
        return (
            <a href={url} key={i} target="_blank" rel="noreferrer">
                {i + 1}
                {i < urls.length - 1 ? ', ' : ''}
            </a>
        );
    });

    return <>{refs}</>;
};

const formatWord = (e: EntryLinked) => {
    return (
        <div id={e.word.toLocaleLowerCase()}>
            <b>{e.word}</b>
            <Edit id={e.id} type="glossary" />
        </div>
    );
};

const formatDef = (e: EntryLinked) => {
    return <span className="padded-table-cell">{e.definition}</span>;
    // return (
    //     <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[externalLinks, remarkBreaks]}>
    //         {e.definition}
    //     </ReactMarkdown>
    // );
};

const Glossary = ({ es }: Props): JSX.Element => {
    const columns = useMemo(
        () => [
            {
                id: 'word',
                selector: (row: EntryLinked) => row.word,
                name: 'Word',
                sortable: true,
                format: formatWord,
                wrap: true,
                maxWidth: '250px',
            },
            {
                id: 'defintion',
                selector: (row: EntryLinked) => row.definition,
                name: 'Defintion',
                format: formatDef,
                sortable: true,
                wrap: true,
            },
            {
                id: 'refs',
                selector: (g: EntryLinked) => g.urls,
                name: 'Refs',
                format: formatRefs,
                sort: true,
                wrap: true,
                maxWidth: '100px',
            },
        ],
        [],
    );

    if (es == undefined || es == null) {
        throw new Error('Invalid props passed to Glossary.');
    }
    return (
        <Container className="pt-2" fluid>
            <Head>
                <title>Glossary</title>
                <meta name="description" content="A Glossary of Gall Related Terminology" />
            </Head>
            <h1 className="ml-3 pt-3">A Glossary of Gall Related Terminology</h1>
            <Row className="p-3">
                <Col>
                    <DataTable
                        keyField={'id'}
                        data={es}
                        columns={columns}
                        striped
                        noHeader
                        responsive={false}
                        defaultSortFieldId="word"
                        customStyles={TABLE_CUSTOM_STYLES}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const entries = await mightFailWithArray<Entry>()(allGlossaryEntries());

    return {
        props: {
            es: await linkDefintionToGlossary(entries),
        },
        revalidate: 1,
    };
};

export default Glossary;
