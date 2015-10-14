#!/usr/bin/python
# -*- coding: utf-8 -*-

from django.shortcuts import render_to_response, render
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.core.context_processors import csrf
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse

from google_maps.models import Path, Report
from google_maps.forms import AddPath, AddReport


'''def index(request):

    me = request.user
    try:
        user = User.objects.get(username=me)
    except:
        return HttpResponseRedirect(reverse('login'))
    paths = Path.objects.filter(user=user)

    args = {}
    args.update(csrf(request))
    args['paths'] = paths
    args['form'] = AddPath()
    args['me'] = me
    return render_to_response('main.html', args)'''

def index(request):

    me = request.user
    args = {}
    args.update(csrf(request))
    args['me'] = me
    args['form'] = AddPath()
    return render_to_response('main.html', args)


def my_paths(request):

    me = request.user
    user = User.objects.get(username=me)
    paths = Path.objects.filter(user=user)
    reports = Report.objects.filter(path=paths)

    args = {}
    args['me'] = me
    args['paths'] = paths
    args['reports'] = reports
    return render_to_response('my_paths.html', args)

@login_required
def add_path(request):

    me = request.user
    user = User.objects.get(username=me)
    form = AddPath(request.POST or None)
    if request.method == 'POST':
        #form = AddPath(request.POST)
        if form.is_valid():
            tmpForm = form.save(commit=False)
            tmpForm.user = user
            tmpForm.save()
            return HttpResponseRedirect(reverse('index'))
        else:
            return HttpResponse(form.errors)
    else:
        args = {}
        args.update(csrf(request))
        return render_to_response('add_path.html', args)

@login_required
def retrieve_path(request, user, pathId):

    path = Path.objects.get(id=pathId)
    return HttpResponse(path.route_data)


@login_required
def add_report(request, pathId):
    
    me = request.user
    path = Path.objects.get(id=pathId)
    author = path.user
    if str(me) == author:
        IsMyPath = True
    else:
        IsMyPath = False

    form = AddReport(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            tmpForm = form.save(commit=False)
            tmpForm.path = path
            # tmpForm.is_reported = True
            path.is_reported = True
            path.save()
            tmpForm.save()
            return HttpResponse('Отчет добавлен')
        else:
            return HttpResponse(form.errors)
    else:
        args = {}
        args.update(csrf(request))
        args['form'] = form
        args['me'] = me
        args['path'] = path
    return render_to_response('add_report.html', args)


def get_report(request, pathId):

    me = request.user
    path = Path.objects.get(id=pathId)
    author = path.user
    report = Report.objects.get(path=path)

    args = {}
    args['me'] = me
    args['author'] = author
    args['report'] = report
    return render_to_response('get_report.html', args)

def info(request):

    return render_to_response('info.html')
