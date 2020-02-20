/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
    state = {
        border: '#eee',
        newRepo: '',
        repositories: [],
        loading: false,
    };

    componentDidMount() {
        const repositories = localStorage.getItem('repositories');

        if (repositories) {
            this.setState({ repositories: JSON.parse(repositories) });
        }
    }

    componentDidUpdate(_, prevState) {
        const { repositories } = this.state;
        if (prevState.repositories !== repositories) {
            localStorage.setItem('repositories', JSON.stringify(repositories));
        }
    }

    handleInputChange = e => {
        this.setState({ newRepo: e.target.value });
    };

    handleSubmit = async e => {
        e.preventDefault();
        try {
            const { newRepo, repositories } = this.state;
            if (newRepo === '') return alert('Digite um repositório');
            this.setState({ loading: true });
            const response = await api.get(`/repos/${newRepo}`);

            const data = {
                name: response.data.full_name,
            };
            const exist = repositories.find(repository => repository.name === response.data.full_name);
            if (exist) {
                throw new Error('Repositório duplicado');
            }
            this.setState({
                border: '#eee',
                repositories: [...repositories, data],
                newRepo: '',
                loading: false,
            });
        } catch (e) {
            this.setState({
                border: '#ff0303',
                loading: false
            });
            console.log(e);
        }
    };

    render() {
        const { newRepo, loading, repositories, border } = this.state;
        return (
            <Container>
                <h1>
                    <FaGithubAlt />
                    Repositórios{' '}
                </h1>
                <Form onSubmit={this.handleSubmit} inputBorder={border}>
                    <input
                        type="text"
                        placeholder="Adicionar repositório"
                        value={newRepo}
                        onChange={this.handleInputChange}
                    />
                    <SubmitButton loading={loading.toString()}>
                        {' '}
                        {loading ? (
                            <FaSpinner color="#FFF" size={14} />
                        ) : (
                                <FaPlus color="#FFF" size={14} />
                            )}{' '}
                    </SubmitButton>{' '}
                </Form>
                <List>
                    {' '}
                    {repositories.map(repository => (
                        <li key={repository.name}>
                            <span> {repository.name} </span>
                            <Link
                                to={`/repository/${encodeURIComponent(
                                    repository.name
                                )}`}
                            >
                                Detalhes{' '}
                            </Link>{' '}
                        </li>
                    ))}{' '}
                </List>{' '}
            </Container>
        );
    }
}
